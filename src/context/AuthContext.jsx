import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // §17.2 users tablosuna karşılık gelen /auth/me yanıtı
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem("access_token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const res = await authApi.login(credentials);
    localStorage.setItem("access_token", res.access_token);
    const me = await authApi.getMe();
    setUser(me);
    return me;
  }

  async function register(payload) {
    await authApi.register(payload);
    // Backend'in /auth/register uç noktası token DÖNMÜYOR (sadece kullanıcıyı
    // oluşturuyor) — otomatik giriş deneyimi için hemen ardından login çağrılır.
    return login({ email: payload.email, password: payload.password });
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem("access_token");
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth, AuthProvider içinde kullanılmalı");
  return ctx;
}

// src/api/auth.js
//
// Gerçek backend (feature/backend-api branch, app/routers/auth.py) okunarak
// güncellendi. Önemli farklar (SRS/varsayımdan):
//   - register() TOKEN DÖNMÜYOR, sadece oluşturulan kullanıcıyı dönüyor.
//     Otomatik giriş deneyimi için register sonrası ayrıca login çağrısı
//     yapılıyor (bkz. AuthContext.register).
//   - `terms_accepted` (Üyelik Sözleşmesi onayı) backend'in UserRegister
//     şemasında YOK — sadece `kvkk_accepted` ve `newsletter_allowed` var.
//     UI'daki checkbox'ı KALDIRMADIK (SRS §4.10 hâlâ zorunlu kılıyor),
//     ama backend'e gönderilmiyor; backend ekibiyle konuşulması gerekiyor.
//   - logout için backend uç noktası yok (JWT stateless) — client-side.
//   - forgot/reset-password için backend uç noktası HENÜZ yok.

import { api, ApiError } from "./client";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function register({
  name,
  email,
  phone,
  password,
  passwordConfirm,
  kvkkAccepted,
  newsletterAllowed,
}) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    localStorage.setItem("mock_user", JSON.stringify({ name, email, phone }));
    return { id: 1, name, email, phone };
  }
  // Not: password_confirm backend'de de doğrulanıyor (şifreler eşleşmiyorsa 422)
  return api.post(
    "/auth/register",
    {
      name,
      email,
      phone: phone || null,
      password,
      password_confirm: passwordConfirm,
      kvkk_accepted: kvkkAccepted,
      newsletter_allowed: newsletterAllowed,
    },
    { auth: false }
  );
}

export async function login({ email, password }) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const stored = JSON.parse(localStorage.getItem("mock_user") || "null");
    localStorage.setItem(
      "mock_user",
      JSON.stringify(stored || { name: "Test Kullanıcı", email, phone: "" })
    );
    return { access_token: "mock_token", token_type: "bearer", expires_in: 3600 };
  }
  return api.post("/auth/login", { email, password }, { auth: false });
}

export async function logout() {
  // Backend'de logout uç noktası yok (JWT stateless) — sadece client-side temizlik.
  localStorage.removeItem("mock_user");
  return null;
}

export function forgotPassword({ email }) {
  // TODO(backend): /auth/forgot-password henüz kodlanmadı.
  if (USE_MOCK) return Promise.resolve(null);
  return Promise.reject(new ApiError("Bu özellik henüz backend'de mevcut değil.", 501, []));
}

export function resetPassword() {
  // TODO(backend): /auth/reset-password henüz kodlanmadı.
  return Promise.reject(new ApiError("Bu özellik henüz backend'de mevcut değil.", 501, []));
}

export async function getMe() {
  if (USE_MOCK) {
    const stored = JSON.parse(localStorage.getItem("mock_user") || "null");
    return stored || { name: "Test Kullanıcı", email: "test@example.com", phone: "" };
  }
  return api.get("/auth/me");
}

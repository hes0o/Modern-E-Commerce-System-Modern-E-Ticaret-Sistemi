import { createContext, useState, useEffect, useCallback } from 'react'
import { authService } from '@/services/authService'

export const AuthContext = createContext(null)

const STORAGE_KEY = 'shop_admin_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const fullUser = await authService.login(email, password)
      setUser(fullUser)
      return fullUser
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Giriş başarısız.'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const updateProfile = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }, [])

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

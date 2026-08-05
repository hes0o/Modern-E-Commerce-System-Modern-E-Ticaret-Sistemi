import { createContext, useState, useEffect, useCallback } from 'react'
import { mockUsers } from '@/mock/users'

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
      // Simulate network delay
      await new Promise(r => setTimeout(r, 800))
      const found = mockUsers.find(
        u => u.email === email && u.password === password
      )
      if (!found) {
        throw new Error('Invalid email or password')
      }
      const { password: _pw, ...safeUser } = found
      setUser(safeUser)
      return safeUser
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
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

/**
 * authService — wraps mock authentication.
 * To connect to a real API, replace the mock calls with api.post(...) calls.
 */
import { mockUsers } from '@/mock/users'

const delay = (ms) => new Promise(r => setTimeout(r, ms))

export const authService = {
  /**
   * Login with email and password
   * Real API: return api.post('/auth/login', { email, password })
   */
  async login(email, password) {
    await delay(600)
    const user = mockUsers.find(u => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid credentials')
    const { password: _pw, ...safeUser } = user
    return { ...safeUser, token: `mock-token-${safeUser.id}` }
  },

  /**
   * Logout (clear session)
   * Real API: return api.post('/auth/logout')
   */
  async logout() {
    await delay(200)
    return { success: true }
  },

  /**
   * Refresh token
   * Real API: return api.post('/auth/refresh')
   */
  async refreshToken() {
    await delay(200)
    return { token: 'refreshed-mock-token' }
  },
}

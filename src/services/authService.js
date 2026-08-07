/**
 * authService — real API authentication.
 */
import api from '@/services/api'

export const authService = {
  /**
   * Login with email and password.
   * Backend returns { success, data: { access_token, token_type, expires_in }, message }
   */
  async login(email, password) {
    const res = await api.post('/api/auth/login', { email, password })
    const { access_token } = res.data.data

    // Store token so the axios interceptor can attach it
    const tokenUser = { token: access_token }
    localStorage.setItem('shop_admin_user', JSON.stringify(tokenUser))

    // Now fetch the full user profile
    const meRes = await api.get('/api/auth/me')
    const profile = meRes.data.data

    const fullUser = { ...profile, token: access_token }
    localStorage.setItem('shop_admin_user', JSON.stringify(fullUser))
    return fullUser
  },

  /**
   * Logout (clear session)
   */
  async logout() {
    localStorage.removeItem('shop_admin_user')
    return { success: true }
  },

  /**
   * Get current user profile
   */
  async getMe() {
    const res = await api.get('/api/auth/me')
    return res.data.data
  },
}

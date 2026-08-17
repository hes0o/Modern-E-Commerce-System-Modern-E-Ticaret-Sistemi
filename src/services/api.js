import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'

/**
 * Axios instance pre-configured for the REST API.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach Bearer token
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('shop_admin_user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`
        }
      } catch {
        // ignore
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config

    // Do not redirect on 401 for auth endpoints (login, register)
    const isAuthRequest =
      originalRequest.url.includes('/api/auth/login') ||
      originalRequest.url.includes('/api/auth/register')

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('shop_admin_user')
      // Redirect to correct login based on which section of the app we're in
      const isAdminPage = window.location.pathname.startsWith('/admin')
      window.location.href = isAdminPage ? '/admin' : '/login'
    }
    return Promise.reject(error)
  }
)

export default api

import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'

/**
 * Axios instance pre-configured for the REST API.
 * When connecting to a real Python backend, only this file and
 * individual service files need to change — no page components.
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
    if (error.response?.status === 401) {
      localStorage.removeItem('shop_admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

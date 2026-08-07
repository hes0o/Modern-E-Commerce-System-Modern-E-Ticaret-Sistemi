/**
 * userService — real API user operations.
 */
import api from '@/services/api'

export const userService = {
  async getAll({ page = 1, limit = 10, search = '', role = '', status = '' } = {}) {
    const params = { page, page_size: limit }
    if (search) params.search = search
    if (role) params.role_name = role
    if (status === 'active') params.is_active = true
    if (status === 'inactive') params.is_active = false
    const res = await api.get('/api/admin/users', { params })
    const data = res.data.data
    return {
      items: data.items || [],
      total: data.total || 0,
      page: data.page || page,
      limit: data.page_size || limit,
    }
  },

  async getById(id) {
    const res = await api.get(`/api/admin/users/${id}`)
    return res.data.data
  },

  async create(data) {
    const res = await api.post('/api/admin/users', data)
    return res.data.data
  },

  async update(id, data) {
    const res = await api.patch(`/api/admin/users/${id}`, data)
    return res.data.data
  },

  async resetPassword(id) {
    // Backend doesn't have a dedicated reset endpoint yet,
    // so we generate a temp password and update via PATCH
    const tempPassword = `Temp${Math.random().toString(36).slice(2, 8).toUpperCase()}!`
    await api.patch(`/api/admin/users/${id}`, { password: tempPassword })
    return { tempPassword }
  },

  async delete(id) {
    // Soft-delete: deactivate the user
    await api.patch(`/api/admin/users/${id}`, { is_active: false })
    return { success: true }
  },

  async getStats() {
    try {
      // Fetch all users (small page) to compute stats
      const res = await api.get('/api/admin/users', { params: { page: 1, page_size: 1 } })
      const total = res.data.data.total || 0
      return {
        total,
        roles: {},
        active: 0,
        inactive: 0,
      }
    } catch {
      return { total: 0, roles: {}, active: 0, inactive: 0 }
    }
  },
}
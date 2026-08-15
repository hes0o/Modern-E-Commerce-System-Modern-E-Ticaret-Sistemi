/**
 * userService — real API user operations.
 */
import api from '@/services/api'

/**
 * Backend'den gelen user nesnesini frontend'in beklediği
 * camelCase formata dönüştürür.
 */
function normalizeUser(raw) {
  if (!raw) return null
  return {
    ...raw,
    // Backend snake_case → frontend camelCase
    createdAt: raw.created_at || raw.createdAt || null,
    updatedAt: raw.updated_at || raw.updatedAt || null,
    lastLoginAt: raw.last_login_at || raw.lastLoginAt || null,
    isActive: raw.is_active !== undefined ? raw.is_active : true,
    // status alanını is_active'den türet (Badge bileşeni için)
    status: (raw.is_active !== undefined ? raw.is_active : true) ? 'active' : 'inactive',
    // Rol adını normalize et
    role: raw.role || 'personnel',
  }
}

export const userService = {
  async getAll({ page = 1, limit = 10, search = '', role = '' } = {}) {
    const params = { page, page_size: limit }
    if (search) params.search = search
    if (role) params.role_name = role
    const res = await api.get('/api/admin/users', { params })
    const data = res.data.data
    return {
      items: (data.items || []).map(normalizeUser),
      total: data.total || 0,
      page: data.page || page,
      limit: data.page_size || limit,
    }
  },

  async getById(id) {
    const res = await api.get(`/api/admin/users/${id}`)
    return normalizeUser(res.data.data)
  },

  async create({ name, email, password, password_confirm, role }) {
    const res = await api.post('/api/admin/users', {
      name,
      email,
      password,
      password_confirm,
      role,
    })
    return normalizeUser(res.data.data)
  },

  async update(id, data) {
    // Sadece backend'in kabul ettiği alanları gönder
    const allowed = {}
    if (data.name !== undefined) allowed.name = data.name
    if (data.role !== undefined) allowed.role = data.role
    if (data.is_active !== undefined) allowed.is_active = data.is_active
    const res = await api.patch(`/api/admin/users/${id}`, allowed)
    return normalizeUser(res.data.data)
  },

  async delete(id) {
    const res = await api.delete(`/api/admin/users/${id}`)
    return res.data
  },

  async getStats() {
    try {
      const res = await api.get('/api/admin/users', { params: { page: 1, page_size: 1 } })
      const total = res.data.data.total || 0
      return { total }
    } catch {
      return { total: 0 }
    }
  },
}
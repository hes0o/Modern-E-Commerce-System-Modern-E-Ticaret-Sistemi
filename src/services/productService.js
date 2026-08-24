/**
 * productService — real API product operations.
 */
import api from '@/services/api'

export const productService = {
  async getAll({ page = 1, limit = 10, search = '', category = '', status = '', brandId = '', priceMin = '', priceMax = '', sortBy = '' } = {}) {
    const params = { page, page_size: limit }
    if (search) params.search = search
    if (category) params.category_id = category
    if (status) params.status = status
    if (brandId) params.brand_id = brandId
    if (priceMin !== '') params.price_min = priceMin
    if (priceMax !== '') params.price_max = priceMax
    if (sortBy) params.sort_by = sortBy
    const res = await api.get('/api/products', { params })
    const data = res.data.data
    return {
      items: data.items || [],
      total: data.total || 0,
      page: data.page || page,
      limit: data.page_size || limit,
    }
  },

  async getById(id) {
    const res = await api.get(`/api/products/${id}`)
    return res.data.data
  },

  async create(data) {
    const res = await api.post('/api/products', data)
    return res.data.data
  },

  async update(id, data) {
    const res = await api.put(`/api/products/${id}`, data)
    return res.data.data
  },

  async toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const res = await api.put(`/api/products/${id}`, { status: newStatus })
    return res.data.data
  },

  async delete(id) {
    const res = await api.delete(`/api/products/${id}`)
    return res.data.data
  },
}

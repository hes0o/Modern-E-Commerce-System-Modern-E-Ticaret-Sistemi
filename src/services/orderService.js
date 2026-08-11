/**
 * orderService — real API order operations.
 */
import api from '@/services/api'

export const orderService = {
  async getAll({ page = 1, limit = 10, search = '', status = '' } = {}) {
    const params = { page, page_size: limit }
    if (status) params.order_status = status
    const res = await api.get('/api/orders/admin', { params })
    const data = res.data.data
    return {
      items: data.items || [],
      total: data.total || 0,
      page: data.page || page,
      limit: data.page_size || limit,
    }
  },

  async getById(id) {
    const res = await api.get(`/api/orders/admin/${id}`)
    return res.data.data
  },

  async create(data) {
    const res = await api.post('/api/orders', data)
    return res.data.data
  },

  async updateStatus(id, status, note = '') {
    const res = await api.patch(`/api/orders/admin/${id}/status`, { status, note })
    return res.data.data
  },

  async getStats() {
    try {
      const res = await api.get('/api/admin/dashboard')
      return res.data.data
    } catch {
      return {
        todayOrders: 0,
        monthlyRevenue: 0,
        totalRevenue: 0,
        statusCounts: {},
        totalOrders: 0,
      }
    }
  },

  async getSalesByMonth() {
    try {
      const res = await api.get('/api/admin/reports/monthly-sales')
      return res.data.data || []
    } catch {
      return []
    }
  },
}

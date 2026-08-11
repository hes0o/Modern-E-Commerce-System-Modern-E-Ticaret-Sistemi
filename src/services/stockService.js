/**
 * stockService — real API stock operations.
 */
import api from '@/services/api'

export const stockService = {
  async getAll({ page = 1, limit = 10, search = '', filter = '' } = {}) {
    const params = { page, page_size: limit }
    if (filter === 'low' || filter === 'out') {
      // Backend filters by movement_type, but for stock overview
      // we query all movements and let the page handle filtering
    }
    const res = await api.get('/api/admin/stock/movements', { params })
    const data = res.data.data
    return {
      items: data.items || [],
      total: data.total || 0,
      page: data.page || page,
      limit: data.page_size || limit,
    }
  },

  async updateQuantity(id, quantity, reason = 'Manuel güncelleme') {
    const diff = quantity  // The backend expects a delta, not absolute
    const res = await api.patch(`/api/admin/stock/products/${id}`, {
      quantity: diff,
      reason,
    })
    return res.data.data
  },

  async getHistory(id) {
    const res = await api.get('/api/admin/stock/movements', {
      params: { product_id: id, page_size: 50 },
    })
    return res.data.data.items || []
  },

  async getStats() {
    try {
      const res = await api.get('/api/admin/dashboard')
      const data = res.data.data
      return {
        total: data.total_products || 0,
        lowStock: data.low_stock_count || 0,
        outOfStock: data.out_of_stock_count || 0,
        healthy: 0,
        totalValue: 0,
      }
    } catch {
      return { total: 0, lowStock: 0, outOfStock: 0, healthy: 0, totalValue: 0 }
    }
  },
}

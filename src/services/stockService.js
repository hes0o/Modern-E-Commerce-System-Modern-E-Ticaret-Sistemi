/**
 * Stock service - real API stock operations.
 */

import api from '@/services/api'

export const stockService = {

  async getAll({
    page = 1,
    limit = 10,
    search = '',
    filter = '',
  } = {}) {

    const params = {
      page,
      page_size: limit,
    }

    if (search) {
      params.search = search
    }

    if (filter) {
      params.filter = filter
    }

    const res = await api.get(
      '/api/admin/stock/products',
      { params }
    )

    const data = res.data.data

    return {
      items: data.items || [],
      total: data.total || 0,
      page: data.page || page,
      limit: data.page_size || limit,
    }
  },


  async updateQuantity(
    id,
    quantity,
    reason = 'Manuel güncelleme'
  ) {

    const res = await api.patch(
      `/api/admin/stock/products/${id}`,
      {
        operation: 'adjustment',
        new_stock_count: Number(quantity),
        note: reason,
      }
    )

    return res.data.data
  },


  async getHistory(id) {

    const res = await api.get(
      '/api/admin/stock/movements',
      {
        params: {
          product_id: id,
          page_size: 50,
        },
      }
    )

    return res.data.data.items || []
  },


  async getStats() {

    try {

      const res = await api.get(
        '/api/admin/dashboard'
      )

      const data = res.data.data

      return {
        total: data.total_products || 0,
        lowStock: data.low_stock_count || 0,
        outOfStock: data.out_of_stock_count || 0,
        healthy: 0,
        totalValue: 0,
      }

    } catch {

      return {
        total: 0,
        lowStock: 0,
        outOfStock: 0,
        healthy: 0,
        totalValue: 0,
      }
    }
  },
}
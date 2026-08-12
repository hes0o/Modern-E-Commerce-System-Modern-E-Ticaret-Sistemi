/**
 * orderService — real API order operations.
 */
import api from '@/services/api'

const STATUS_LABELS = {
  pending: 'Beklemede',
  confirmed: 'Onaylandı',
  preparing: 'Hazırlanıyor',
  shipped: 'Kargoda',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
}

const normalizeOrder = (order) => {
  const address = order.shipping_address_snapshot || {}

  return {
    ...order,
    customer:
      order.user_name ||
      order.guest_name ||
      (order.user_id ? `Kullanıcı #${order.user_id}` : 'Misafir'),
    email: order.user_email || order.guest_email || '',
    phone: order.user_phone || order.guest_phone || address.phone || '',
    address: [
      address.full_address,
      address.district,
      address.city,
      address.postal_code,
    ].filter(Boolean).join(', '),
    orderedAt: order.created_at,
    paymentMethod: order.payment_method,
    trackingNo: order.shipping_tracking_number,
    notes: order.customer_note || order.admin_note || '',
    tax: order.vat_total,
    shipping: 0,
    total: order.grand_total,
    items: (order.items || []).map((item) => ({
      ...item,
      product: item.product_name_snapshot,
      unitPrice: item.unit_price,
      total: item.line_total,
    })),
    timeline: (order.status_history || []).map((step) => ({
      status: step.new_status,
      label: STATUS_LABELS[step.new_status] || step.new_status,
      date: step.created_at,
    })),
  }
}

export const orderService = {
  async getAll({ page = 1, limit = 10, search = '', status = '' } = {}) {
    const params = { page, page_size: limit }
    if (status) params.order_status = status
    const res = await api.get('/api/orders/admin', { params })
    const data = res.data.data
    return {
    items: (data.items || []).map(normalizeOrder),
      total: data.total || 0,
      page: data.page || page,
      limit: data.page_size || limit,
    }
  },

  async getById(id) {
    const res = await api.get(`/api/orders/admin/${id}`)
    return normalizeOrder(res.data.data)
  },

  async create(data) {
    const res = await api.post('/api/orders', data)
    return res.data.data
  },

  async updateStatus(id, status, note = '') {
    const res = await api.patch(`/api/orders/admin/${id}/status`, { status, note })
    return normalizeOrder(res.data.data)
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

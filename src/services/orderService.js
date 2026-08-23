/**
 * orderService — real API order operations.
 */
import api from '@/services/api'

export const orderService = {
  formatOrder(raw) {
    if (!raw) return null
    const shippingAddr = raw.shipping_address_snapshot || {}
    const customerName = raw.guest_name || shippingAddr.recipient_name || `Kullanıcı #${raw.user_id || raw.id}`
    const customerEmail = raw.guest_email || '—'
    const customerPhone = raw.guest_phone || shippingAddr.phone || '—'
    const fullAddrStr = [shippingAddr.full_address, shippingAddr.district, shippingAddr.city].filter(Boolean).join(', ') || '—'

    const items = (raw.items || []).map((item) => ({
      id: item.id,
      product: item.product_name_snapshot || `Ürün #${item.product_id}`,
      unitPrice: item.unit_price || 0,
      quantity: item.quantity || 1,
      total: item.line_total || 0,
    }))

    const timeline = (raw.status_history || []).map((h) => ({
      status: h.new_status,
      label: h.new_status,
      date: h.created_at,
    }))

    return {
      id: raw.id,
      orderNumber: raw.order_number || `#${raw.id}`,
      customer: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: fullAddrStr,
      orderedAt: raw.created_at,
      status: raw.status,
      paymentMethod: raw.payment_method === 'cod' ? 'Kapıda Ödeme' : raw.payment_method === 'bank_transfer' ? 'Havale / EFT' : raw.payment_method,
      subtotal: raw.subtotal || 0,
      tax: raw.vat_total || 0,
      shipping: 0,
      total: raw.grand_total || 0,
      customerNote: raw.customer_note || '',
      adminNote: raw.admin_note || '',
      trackingNo: raw.shipping_tracking_number || null,
      shippingCompany: raw.shipping_tracking_number ? 'Kargo Firması' : null,
      items,
      timeline,
      raw,
    }
  },

  async getAll({ page = 1, limit = 10, search = '', status = '' } = {}) {
    const params = { page, page_size: limit }
    if (status) params.order_status = status
    const res = await api.get('/api/orders/admin', { params })
    const data = res.data.data
    const items = (data.items || []).map(this.formatOrder)
    return {
      items,
      total: data.total || 0,
      page: data.page || page,
      limit: data.page_size || limit,
    }
  },

  async getById(id) {
    const res = await api.get(`/api/orders/admin/${id}`)
    return this.formatOrder(res.data.data)
  },

  async create(data) {
    const res = await api.post('/api/orders', data)
    return this.formatOrder(res.data.data)
  },

  async updateStatus(id, status, note = '') {
    const res = await api.patch(`/api/orders/admin/${id}/status`, { status, note })
    return this.formatOrder(res.data.data)
  },

  async updateAdminDetails(id, { adminNote, trackingNo } = {}) {
    const payload = {}
    if (adminNote !== undefined) payload.admin_note = adminNote
    if (trackingNo !== undefined) payload.shipping_tracking_number = trackingNo
    const res = await api.patch(`/api/orders/admin/${id}`, payload)
    return this.formatOrder(res.data.data)
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

  async getSalesByMonth(period = '1M') {
    try {
      const res = await api.get('/api/admin/reports/monthly-sales', { params: { period } })
      const points = res.data?.data?.points || []
      // SalesChart { name, sales, orders } formatına dönüştür
      return points.map((p) => ({
        name: p.name,
        sales: p.sales,
        orders: p.orders,
      }))
    } catch {
      return []
    }
  },
}

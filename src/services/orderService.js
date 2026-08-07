/**
 * orderService — wraps mock order data.
 * Real API: replace with api.get('/orders', ...) etc.
 */
import { mockOrders } from '@/mock/orders'

let _orders = [...mockOrders]
const delay = (ms) => new Promise(r => setTimeout(r, ms))

export const orderService = {
  async getAll({ page = 1, limit = 10, search = '', status = '' } = {}) {
    await delay(300)
    let data = [..._orders]
    if (search) data = data.filter(o =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
    )
    if (status) data = data.filter(o => o.status === status)
    const total = data.length
    const items = data.slice((page - 1) * limit, page * limit)
    return { items, total, page, limit }
  },

  async getById(id) {
    await delay(200)
    const order = _orders.find(o => o.id === id)
    if (!order) throw new Error('Order not found')
    return { ...order }
  },

  async create(data) {
    await delay(500)
    const newOrder = {
      ...data,
      id: `ORD-${String(Date.now()).slice(-6)}`,
      status: 'pending',
      orderedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      trackingNo: null,
      timeline: [{ status: 'pending', label: 'Sipariş Alındı', date: new Date().toISOString().split('T')[0] }],
    }
    _orders.unshift(newOrder)
    return newOrder
  },

  async updateStatus(id, status) {
    await delay(400)
    const idx = _orders.findIndex(o => o.id === id)
    if (idx === -1) throw new Error('Order not found')
    const today = new Date().toISOString().split('T')[0]
    const statusLabels = {
      pending: 'Sipariş Alındı',
      processing: 'Hazırlanıyor',
      shipped: 'Kargoya Verildi',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi',
    }
    // Build updated timeline
    const existingTimeline = _orders[idx].timeline || []
    const alreadyHasStatus = existingTimeline.some(t => t.status === status)
    const updatedTimeline = alreadyHasStatus
      ? existingTimeline
      : [...existingTimeline, { status, label: statusLabels[status] || status, date: today }]

    _orders[idx] = {
      ..._orders[idx],
      status,
      updatedAt: today,
      timeline: updatedTimeline,
      // Auto-assign tracking when shipped
      ...(status === 'shipped' && !_orders[idx].trackingNo
        ? { trackingNo: `TRK${Math.floor(Math.random() * 900000000 + 100000000)}` }
        : {}),
    }
    return { ..._orders[idx] }
  },

  async getStats() {
    await delay(200)
    const today = new Date().toISOString().split('T')[0]
    const todayOrders = _orders.filter(o => o.orderedAt === today)
    const now = new Date()

    const monthlyRevenue = _orders
      .filter(o => {
        const d = new Date(o.orderedAt)
        return (
          o.status === 'delivered' &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        )
      })
      .reduce((sum, o) => sum + o.total, 0)
    const totalRevenue = _orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0)
    const statusCounts = Object.fromEntries(
      ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => [
        s, _orders.filter(o => o.status === s).length
      ])
    )
    return {
      todayOrders: todayOrders.length,
      monthlyRevenue,
      totalRevenue,
      statusCounts,
      totalOrders: _orders.length,
    }
  },

  async getSalesByMonth() {
    await delay(200)
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
    const data = months.map((name, idx) => {
      const monthOrders = _orders.filter(o => {
        const d = new Date(o.orderedAt)
        return d.getFullYear() === 2026 && d.getMonth() === idx
      })
      const sales = monthOrders.reduce((s, o) => s + o.total, 0)
      const orders = monthOrders.length
      return { name, sales: parseFloat(sales.toFixed(2)), orders }
    })
    return data
  },
}

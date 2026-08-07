/**
 * stockService — wraps mock stock data.
 * Real API: replace with api.get('/stock', ...) etc.
 */
import { mockStock } from '@/mock/stock'
import { LOW_STOCK_THRESHOLD } from '@/utils/constants'

let _stock = [...mockStock]
const delay = (ms) => new Promise(r => setTimeout(r, ms))

// Mock movement history per product
const _movements = {}
_stock.forEach(item => {
  _movements[item.id] = [
    {
      id: 1,
      type: 'in',
      quantity: item.currentStock,
      reason: 'Başlangıç stoğu',
      date: '2026-01-15',
      user: 'Alice Johnson',
    },
  ]
})

export const stockService = {
  async getAll({ page = 1, limit = 10, search = '', filter = '' } = {}) {
    await delay(300)
    let data = [..._stock]
    if (search) data = data.filter(s =>
      s.productName.toLowerCase().includes(search.toLowerCase()) ||
      s.sku.toLowerCase().includes(search.toLowerCase())
    )
    if (filter === 'low') data = data.filter(s => s.currentStock > 0 && s.currentStock <= LOW_STOCK_THRESHOLD)
    if (filter === 'out') data = data.filter(s => s.currentStock === 0)
    const total = data.length
    const items = data.slice((page - 1) * limit, page * limit)
    return { items, total, page, limit }
  },

  async updateQuantity(id, quantity, reason = 'Manuel güncelleme', user = 'Admin') {
    await delay(300)
    const idx = _stock.findIndex(s => s.id === Number(id))
    if (idx === -1) throw new Error('Stock item not found')
    const previous = _stock[idx].currentStock
    const diff = quantity - previous
    _stock[idx] = {
      ..._stock[idx],
      currentStock: quantity,
      lastRestocked: new Date().toISOString().split('T')[0],
    }
    // Record movement
    if (!_movements[id]) _movements[id] = []
    _movements[id].push({
      id: Date.now(),
      type: diff >= 0 ? 'in' : 'out',
      quantity: Math.abs(diff),
      previousStock: previous,
      newStock: quantity,
      reason,
      date: new Date().toISOString().split('T')[0],
      user,
    })
    return { ..._stock[idx] }
  },

  async getHistory(id) {
    await delay(200)
    return [...(_movements[Number(id)] || [])].reverse()
  },

  async getStats() {
    await delay(200)
    return {
      total: _stock.length,
      lowStock: _stock.filter(s => s.currentStock > 0 && s.currentStock <= LOW_STOCK_THRESHOLD).length,
      outOfStock: _stock.filter(s => s.currentStock === 0).length,
      healthy: _stock.filter(s => s.currentStock > LOW_STOCK_THRESHOLD).length,
      totalValue: _stock.reduce((sum, s) => sum + s.currentStock * 100, 0), // mock unit cost
    }
  },
}

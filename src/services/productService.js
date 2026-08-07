/**
 * productService — wraps mock product data.
 * Real API: replace with api.get('/products', ...) etc.
 */
import { mockProducts } from '@/mock/products'

let _products = [...mockProducts]
const delay = (ms) => new Promise(r => setTimeout(r, ms))

export const productService = {
  async getAll({ page = 1, limit = 10, search = '', category = '', status = '' } = {}) {
    await delay(300)
    let data = [..._products]
    if (search) data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
    if (category) data = data.filter(p => p.category === category)
    if (status) data = data.filter(p => p.status === status)
    const total = data.length
    const items = data.slice((page - 1) * limit, page * limit)
    return { items, total, page, limit }
  },

  async getById(id) {
    await delay(200)
    const product = _products.find(p => p.id === Number(id))
    if (!product) throw new Error('Product not found')
    return product
  },

  async create(data) {
    await delay(500)
    const newProduct = {
      ...data,
      id: Math.max(..._products.map(p => p.id)) + 1,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    _products.unshift(newProduct)
    return newProduct
  },

  async update(id, data) {
    await delay(400)
    const idx = _products.findIndex(p => p.id === Number(id))
    if (idx === -1) throw new Error('Product not found')
    _products[idx] = { ..._products[idx], ...data, updatedAt: new Date().toISOString().split('T')[0] }
    return _products[idx]
  },

  async delete(id) {
    await delay(300)
    _products = _products.filter(p => p.id !== Number(id))
    return { success: true }
  },
}

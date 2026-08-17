import api from '@/services/api'

const SESSION_KEY = 'shop_session_token'

function getSessionHeaders() {
  const token = localStorage.getItem(SESSION_KEY)
  return token ? { 'X-Session-Token': token } : {}
}

export const cartService = {
  async getCart() {
    const res = await api.get('/api/cart', { headers: getSessionHeaders() })
    const data = res.data.data
    if (data?.session_token) {
      localStorage.setItem(SESSION_KEY, data.session_token)
    }
    return data
  },

  async addItem(productId, variantId = null, quantity = 1) {
    const res = await api.post(
      '/api/cart/items',
      { product_id: productId, variant_id: variantId, quantity },
      { headers: getSessionHeaders() }
    )
    const data = res.data.data
    if (data?.session_token) {
      localStorage.setItem(SESSION_KEY, data.session_token)
    }
    return data
  },

  async updateItem(itemId, quantity) {
    const res = await api.put(
      `/api/cart/items/${itemId}`,
      { quantity },
      { headers: getSessionHeaders() }
    )
    return res.data.data
  },

  async removeItem(itemId) {
    const res = await api.delete(`/api/cart/items/${itemId}`, {
      headers: getSessionHeaders(),
    })
    return res.data.data
  },

  async clearCart() {
    const res = await api.delete('/api/cart/items', { headers: getSessionHeaders() })
    return res.data.data
  },
}

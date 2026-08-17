import api from '@/services/api'

export const favoriteService = {
  async getAll() {
    const res = await api.get('/api/favorites')
    return res.data.data || []
  },
  async add(productId) {
    const res = await api.post('/api/favorites', { product_id: productId })
    return res.data.data
  },
  async remove(productId) {
    const res = await api.delete(`/api/favorites/${productId}`)
    return res.data.data
  },
}

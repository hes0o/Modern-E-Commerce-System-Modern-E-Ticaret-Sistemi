import api from '@/services/api'

export const addressService = {
  async getAll() {
    const res = await api.get('/api/addresses')
    return res.data.data || []
  },
  async create(data) {
    const res = await api.post('/api/addresses', data)
    return res.data.data
  },
  async update(id, data) {
    const res = await api.put(`/api/addresses/${id}`, data)
    return res.data.data
  },
  async remove(id) {
    const res = await api.delete(`/api/addresses/${id}`)
    return res.data.data
  },
}

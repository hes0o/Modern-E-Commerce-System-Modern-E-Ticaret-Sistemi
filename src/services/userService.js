/**
 * userService — wraps mock user data.
 * Real API: replace with api.get('/users', ...) etc.
 */
import { mockUsers } from '@/mock/users'

let _users = [...mockUsers]
const delay = (ms) => new Promise(r => setTimeout(r, ms))

export const userService = {
  async getAll({ page = 1, limit = 10, search = '', role = '' } = {}) {
    await delay(300)
    let data = [..._users]
    if (search) data = data.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
    if (role) data = data.filter(u => u.role === role)
    const total = data.length
    const items = data.slice((page - 1) * limit, page * limit).map(({ password: _pw, ...u }) => u)
    return { items, total, page, limit }
  },

  async getById(id) {
    await delay(200)
    const user = _users.find(u => u.id === Number(id))
    if (!user) throw new Error('User not found')
    const { password: _pw, ...safeUser } = user
    return safeUser
  },

  async update(id, data) {
    await delay(400)
    const idx = _users.findIndex(u => u.id === Number(id))
    if (idx === -1) throw new Error('User not found')
    _users[idx] = { ..._users[idx], ...data }
    const { password: _pw, ...safe } = _users[idx]
    return safe
  },

  async delete(id) {
    await delay(300)
    _users = _users.filter(u => u.id !== Number(id))
    return { success: true }
  },

  async getStats() {
    await delay(200)
    return {
      total: _users.length,
      byRole: {
        Admin: _users.filter(u => u.role === 'Admin').length,
        Employee: _users.filter(u => u.role === 'Employee').length,
        Customer: _users.filter(u => u.role === 'Customer').length,
        Guest: _users.filter(u => u.role === 'Guest').length,
      },
      active: _users.filter(u => u.status === 'active').length,
    }
  },
}

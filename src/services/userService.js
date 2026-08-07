/**
 * userService — wraps mock user data.
 * Real API: replace with api.get('/users', ...) etc.
 */

import { mockUsers } from '@/mock/users'

let _users = [...mockUsers]

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const userService = {
  async getAll({
    page = 1,
    limit = 10,
    search = '',
    role = '',
    status = '',
  } = {}) {
    await delay(300)

    let data = [..._users]

    if (search) {
      const keyword = search.toLowerCase()

      data = data.filter(
        (u) =>
          u.name.toLowerCase().includes(keyword) ||
          u.email.toLowerCase().includes(keyword) ||
          (u.phone && u.phone.includes(search))
      )
    }

    if (role) {
      data = data.filter((u) => u.role === role)
    }

    if (status) {
      data = data.filter((u) => u.status === status)
    }

    const total = data.length

    const items = data
      .slice((page - 1) * limit, page * limit)
      .map(({ password, ...user }) => user)

    return {
      items,
      total,
      page,
      limit,
    }
  },

  async getById(id) {
    await delay(200)

    const user = _users.find((u) => u.id === Number(id))

    if (!user) {
      throw new Error('User not found')
    }

    const { password, ...safeUser } = user

    return safeUser
  },

  async create(data) {
    await delay(500)

    const exists = _users.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    )

    if (exists) {
      throw new Error('Bu e-posta adresi zaten kayıtlı.')
    }

    const newUser = {
      id:
        _users.length > 0
          ? Math.max(..._users.map((u) => u.id)) + 1
          : 1,
      avatar: null,
      orders: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: null,
      ...data,
    }

    _users.push(newUser)

    const { password, ...safeUser } = newUser

    return safeUser
  },

  async update(id, data) {
    await delay(400)

    const index = _users.findIndex((u) => u.id === Number(id))

    if (index === -1) {
      throw new Error('User not found')
    }

    if (data.email) {
      const exists = _users.find(
        (u) =>
          u.email.toLowerCase() === data.email.toLowerCase() &&
          u.id !== Number(id)
      )

      if (exists) {
        throw new Error('Bu e-posta adresi başka bir kullanıcıya ait.')
      }
    }

    _users[index] = {
      ..._users[index],
      ...data,
    }

    const { password, ...safeUser } = _users[index]

    return safeUser
  },

  async resetPassword(id) {
    await delay(300)

    const index = _users.findIndex((u) => u.id === Number(id))

    if (index === -1) {
      throw new Error('User not found')
    }

    const tempPassword =
      `Temp${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}!`

    _users[index].password = tempPassword

    return {
      tempPassword,
    }
  },

  async delete(id) {
    await delay(300)

    _users = _users.filter((u) => u.id !== Number(id))

    return {
      success: true,
    }
  },

  async getStats() {
    await delay(200)

    return {
      total: _users.length,

      roles: {
        Admin: _users.filter((u) => u.role === 'Admin').length,
        Employee: _users.filter((u) => u.role === 'Employee').length,
        Customer: _users.filter((u) => u.role === 'Customer').length,
        Guest: _users.filter((u) => u.role === 'Guest').length,
      },

      active: _users.filter((u) => u.status === 'active').length,
      inactive: _users.filter((u) => u.status === 'inactive').length,
    }
  },
}
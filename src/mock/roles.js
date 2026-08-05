export const MODULES = [
  'Dashboard', 'Products', 'Categories', 'Brands',
  'Orders', 'Stock', 'Users', 'Roles', 'Reports', 'Settings',
]

export const PERMISSIONS = ['view', 'create', 'edit', 'delete']

export const mockRoles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full access to all modules',
    color: 'indigo',
    permissions: Object.fromEntries(MODULES.map(m => [m, [...PERMISSIONS]])),
    userCount: 1,
  },
  {
    id: 2,
    name: 'Employee',
    description: 'Can manage products and orders',
    color: 'blue',
    permissions: Object.fromEntries(MODULES.map(m => {
      if (['Dashboard', 'Products', 'Categories', 'Brands', 'Orders', 'Stock'].includes(m)) {
        return [m, ['view', 'create', 'edit']]
      }
      if (m === 'Users') return [m, ['view']]
      return [m, ['view']]
    })),
    userCount: 2,
  },
  {
    id: 3,
    name: 'Customer',
    description: 'Can view their own orders and profile',
    color: 'green',
    permissions: Object.fromEntries(MODULES.map(m => {
      if (m === 'Orders') return [m, ['view']]
      return [m, []]
    })),
    userCount: 4,
  },
  {
    id: 4,
    name: 'Guest',
    description: 'Browse only, no purchases',
    color: 'slate',
    permissions: Object.fromEntries(MODULES.map(m => [m, []])),
    userCount: 1,
  },
]

export const ITEMS_PER_PAGE = 10

export const ORDER_STATUSES = ['pending', 'preparing', 'shipped', 'completed', 'cancelled']

export const PRODUCT_STATUSES = ['active', 'draft', 'out_of_stock']

export const USER_ROLES = ['admin', 'personnel']

export const USER_STATUSES = ['active', 'inactive']

export const COLORS = ['Siyah', 'Beyaz', 'Kırmızı', 'Mavi', 'Yeşil', 'Mor', 'Sarı', 'Gri', 'Turuncu', 'Pembe']

export const SIZES_CLOTHING = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export const SIZES_SHOES = ['36', '37', '38', '39', '40', '41', '42', '43', '44']

export const LOW_STOCK_THRESHOLD = 10

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const APP_NAME = 'MagazaPaneli'

export const NAV_ITEMS = [
  {
    label: 'Kontrol Paneli',
    path: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Ürün Yönetimi',
    icon: 'Package',
    children: [
      { label: 'Tüm Ürünler', path: '/products' },
      { label: 'Yeni Ürün Ekle', path: '/products/new' },
      { label: 'Kategoriler', path: '/products/categories' },
      { label: 'Markalar', path: '/products/brands' },
    ],
  },
  {
    label: 'Sipariş Yönetimi',
    icon: 'ShoppingCart',
    children: [
      { label: 'Tüm Siparişler', path: '/orders' },
    ],
  },
  {
    label: 'Stok Yönetimi',
    path: '/stock',
    icon: 'Warehouse',
  },
  {
    label: 'Kullanıcılar',
    path: '/users',
    icon: 'Users',
  },
  {
    label: 'Roller & İzinler',
    path: '/roles',
    icon: 'Shield',
  },
  {
    label: 'Raporlar & Analizler',
    path: '/reports',
    icon: 'BarChart2',
  },
  {
    label: 'Ayarlar',
    path: '/settings',
    icon: 'Settings',
  },
]

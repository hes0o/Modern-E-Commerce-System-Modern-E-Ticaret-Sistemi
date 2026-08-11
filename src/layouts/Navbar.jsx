import { Menu, Bell, User, LogOut, ChevronDown, Sparkles, Search } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/utils/formatters'
import GlobalSearch from '@/components/common/GlobalSearch'

const PAGE_TITLES = {
  '/dashboard': 'Kontrol Paneli',
  '/products': 'Ürün Yönetimi',
  '/products/new': 'Yeni Ürün Ekle',
  '/products/categories': 'Kategori Yönetimi',
  '/products/brands': 'Marka Yönetimi',
  '/orders': 'Sipariş Yönetimi',
  '/orders/pending': 'Onay Bekleyenler',
  '/orders/preparing': 'Hazırlanan Siparişler',
  '/orders/shipping': 'Kargodaki Siparişler',
  '/orders/delivered': 'Teslim Edilenler',
  '/orders/cancelled': 'İptal Edilenler',
  '/stock': 'Stok Yönetimi',
  '/users': 'Kullanıcı Yönetimi',
  '/roles': 'Roller & İzinler',
  '/reports': 'Raporlar & Analizler',
  '/settings': 'Mağaza Ayarları',
  '/notifications': 'Bildirimler',
  '/profile': 'Kullanıcı Profili',
}

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Global Ctrl+K handler
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleLabel = (role) => {
    const map = { Admin: 'Yönetici', Employee: 'Personel', Customer: 'Müşteri', Guest: 'Misafir' }
    return map[role] || role
  }

  const currentTitle = PAGE_TITLES[location.pathname] || 'Mağaza Paneli'

  return (
    <>
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 shadow-subtle">
        {/* Left Context & Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 lg:hidden transition-colors"
            aria-label="Menüyü aç"
          >
            <Menu size={20} />
          </button>

          {/* Current Breadcrumb / Title */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Yönetim</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold text-sm">{currentTitle}</span>
          </div>
        </div>

        {/* Center Search Bar */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 text-slate-400 hover:border-indigo-300 hover:text-slate-600 transition-all duration-150 text-xs"
          aria-label="Ara"
        >
          <Search size={14} />
          <span>Ara...</span>
          <span className="ml-1 text-[10px] font-medium bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">⌘K</span>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-2" ref={dropdownRef}>
          {/* Mobile search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Ara"
          >
            <Search size={18} />
          </button>

          {/* Quick Notification Bell */}
          <div className="relative">
            <button
              onClick={() => { setNotificationsOpen(v => !v); setDropdownOpen(false) }}
              className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Bildirimler"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200/90 rounded-xl shadow-dropdown py-2 animate-scale-in z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Bildirimler</span>
                  <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">2 Yeni</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer">
                    <p className="font-semibold text-slate-800">Kritik Stok Uyarısı</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">3 ürünün stoğu tükenmek üzere.</p>
                  </div>
                  <div className="px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer">
                    <p className="font-semibold text-slate-800">Yeni Sipariş Alındı</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Sipariş #ORD-01053 oluşturuldu.</p>
                  </div>
                </div>
                <div className="border-t border-slate-100 mt-1">
                  <button
                    onClick={() => { navigate('/notifications'); setNotificationsOpen(false) }}
                    className="w-full py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    Tüm Bildirimleri Gör
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setDropdownOpen(v => !v); setNotificationsOpen(false) }}
              className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-lg hover:bg-slate-100/80 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-subtle flex-shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="hidden md:flex flex-col items-start text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</span>
                <span className="text-[10px] text-slate-500 font-medium">{getRoleLabel(user?.role)}</span>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200/90 rounded-xl shadow-dropdown py-1.5 animate-scale-in z-50">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User size={14} className="text-slate-400" />
                    Profilimi Gör
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Sparkles size={14} className="text-slate-400" />
                    Mağaza Ayarları
                  </Link>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} />
                    Çıkış Yap
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

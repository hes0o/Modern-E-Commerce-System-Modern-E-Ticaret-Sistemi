import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse, Users, Shield,
  BarChart2, Settings, Bell, ChevronDown, ChevronRight, Tag, Award,
  PlusCircle, List, X, Store, Sparkles, CircleCheckBig, Truck, CheckCheck, CircleX,
} from 'lucide-react'
import clsx from 'clsx'

const ICON_MAP = {
  LayoutDashboard, Package, ShoppingCart, Warehouse, Bell, Users, Shield, BarChart2, Settings,
}

const navSections = [
  {
    title: 'Genel',
    items: [
      {
        id: 'dashboard',
        label: 'Kontrol Paneli',
        path: '/dashboard',
        icon: 'LayoutDashboard'
      },
      {
        id: 'notifications',
        label: 'Bildirimler',
        path: '/notifications',
        icon: 'Bell'
      },
    ]
  },
  {
    title: 'Katalog & Siparişler',
    items: [
      {
        id: 'products',
        label: 'Ürün Yönetimi',
        icon: 'Package',
        children: [
          { label: 'Tüm Ürünler', path: '/products', icon: List },
          { label: 'Yeni Ürün Ekle', path: '/products/new', icon: PlusCircle },
          { label: 'Kategoriler', path: '/products/categories', icon: Tag },
          { label: 'Markalar', path: '/products/brands', icon: Award },
        ],
      },
      {
        id: 'orders',
        label: 'Siparişler',
        icon: 'ShoppingCart',
        children: [
          {
            label: 'Tüm Siparişler',
            path: '/orders',
            icon: List,
          },
          {
            label: 'Onay Bekleyenler',
            path: '/orders/pending',
            icon: CircleCheckBig,
          },
          {
            label: 'Hazırlanıyor',
            path: '/orders/preparing',
            icon: Package,
          },
          {
            label: 'Kargoda',
            path: '/orders/shipping',
            icon: Truck,
          },
          {
            label: 'Teslim Edildi',
            path: '/orders/delivered',
            icon: CheckCheck,
          },
          {
            label: 'İptal Edilenler',
            path: '/orders/cancelled',
            icon: CircleX,
          },
        ],
      },
      { id: 'stock', label: 'Stok Yönetimi', path: '/stock', icon: 'Warehouse' },
    ]
  },
  {
    title: 'Yönetim & Analiz',
    items: [
      { id: 'users', label: 'Kullanıcılar', path: '/users', icon: 'Users' },
      { id: 'roles', label: 'Roller & İzinler', path: '/roles', icon: 'Shield' },
      { id: 'reports', label: 'Raporlar & Analizler', path: '/reports', icon: 'BarChart2' },
      { id: 'settings', label: 'Ayarlar', path: '/settings', icon: 'Settings' },
    ]
  }
]

function NavItem({ item, onNavigate }) {
  const location = useLocation()
  const [open, setOpen] = useState(() => {
    if (!item.children) return false
    return item.children.some(c => location.pathname.startsWith(c.path))
  })

  const Icon = ICON_MAP[item.icon]

  if (item.children) {
    const isActive = item.children.some(c => location.pathname.startsWith(c.path))
    return (
      <div className="space-y-1">
        <button
          onClick={() => setOpen(v => !v)}
          className={clsx(
            'sidebar-link w-full text-xs font-medium',
            isActive ? 'bg-slate-800/80 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          )}
        >
          {Icon && <Icon size={16} className={clsx('flex-shrink-0', isActive ? 'text-indigo-400' : 'text-slate-400')} />}
          <span className="flex-1 text-left">{item.label}</span>
          {open
            ? <ChevronDown size={14} className="flex-shrink-0 text-slate-400" />
            : <ChevronRight size={14} className="flex-shrink-0 text-slate-400" />
          }
        </button>
        {open && (
          <div className="ml-3 border-l border-slate-800 pl-3 space-y-0.5 my-1">
            {item.children.map(child => {
              const ChildIcon = child.icon
              return (
                <NavLink
                  key={child.path}
                  to={child.path}
                  end
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-all duration-150 cursor-pointer',
                      isActive
                        ? 'text-white bg-indigo-600/90 font-medium shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    )
                  }
                >
                  <ChildIcon size={13} className="flex-shrink-0" />
                  {child.label}
                </NavLink>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.path}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        clsx(
          'sidebar-link text-xs font-medium',
          isActive ? 'active' : 'text-slate-400 hover:text-slate-200'
        )
      }
    >
      {Icon && <Icon size={16} className="flex-shrink-0" />}
      <span>{item.label}</span>
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full w-64 bg-slate-950 border-r border-slate-800/60 z-40 flex flex-col',
          'transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header / Store Selector */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
              <Store size={18} />
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-tight block">Mağaza Paneli</span>
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Sparkles size={10} className="text-indigo-400" /> Pro Sürüm
              </span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-hide">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {section.title}
              </p>
              <div className="space-y-0.5 mt-1">
                {section.items.map(item => (
                  <NavItem key={item.id} item={item} onNavigate={onClose} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer / Info */}
        <div className="p-3 border-t border-slate-800/60 bg-slate-900/40">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Durum</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Çevrimiçi
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}

import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { User, Package, Heart, MapPin, Lock, LogOut, ChevronRight } from 'lucide-react'

const ACCOUNT_NAV = [
  { path: '/account', label: 'My Profile', icon: User, end: true },
  { path: '/account/orders', label: 'My Orders', icon: Package },
  { path: '/account/favorites', label: 'Wishlist', icon: Heart },
  { path: '/account/addresses', label: 'Addresses', icon: MapPin },
]

export default function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center font-black text-indigo-600 text-xl">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <nav className="mt-3 space-y-0.5">
              {ACCOUNT_NAV.map(({ path, label, icon: Icon, end }) => (
                <NavLink key={path} to={path} end={end}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-slate-900'}`}>
                  <Icon size={16} />
                  {label}
                  <ChevronRight size={13} className="ml-auto opacity-40" />
                </NavLink>
              ))}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all mt-2 border-t border-gray-100 pt-3">
                <LogOut size={16} /> Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="md:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

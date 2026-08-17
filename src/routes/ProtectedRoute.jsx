import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ShieldOff } from 'lucide-react'

// Roles that are allowed to access the admin panel
const ADMIN_ROLES = ['admin', 'personnel']

function AccessDenied({ user, logout }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto">
          <ShieldOff size={32} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Erişim Reddedildi</h1>
          <p className="text-sm text-slate-500 mt-2">
            <strong>{user?.name}</strong> ({user?.role}) rolü ile yönetim paneline erişim yetkiniz bulunmamaktadır.
          </p>
        </div>
        <button
          onClick={logout}
          className="btn btn-primary w-full h-11 text-sm font-semibold rounded-xl"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  )
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/admin" state={{ from: location }} replace />
  }

  // Block non-admin/personnel roles (e.g. customers) from the admin panel
  if (!ADMIN_ROLES.includes(user?.role)) {
    return <AccessDenied user={user} logout={logout} />
  }

  return children
}

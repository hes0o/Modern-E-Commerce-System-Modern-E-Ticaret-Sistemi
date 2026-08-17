/**
 * CustomerRoute — protects storefront pages that require authentication.
 * Redirects unauthenticated users to the CUSTOMER login page (/login),
 * NOT the admin login page (/admin).
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function CustomerRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

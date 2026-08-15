import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ProtectedRoute from './ProtectedRoute'
import AdminLayout from '@/layouts/AdminLayout'
import LoginPage from '@/pages/auth/LoginPage'

// Lazy-load pages
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))

// Products
const ProductListPage = lazy(() => import('@/pages/products/ProductListPage'))
const ProductFormPage = lazy(() => import('@/pages/products/ProductFormPage'))
const CategoriesBrandsPage = lazy(() => import('@/pages/products/CategoriesBrandsPage'))

// Orders
const OrderListPage = lazy(() => import('@/pages/orders/OrderListPage'))
const OrderDetailPage = lazy(() => import('@/pages/orders/OrderDetailPage'))
const PendingOrdersPage = lazy(() => import('@/pages/orders/PendingOrdersPage'))
const PreparingOrdersPage = lazy(() => import('@/pages/orders/PreparingOrdersPage'))
const ShippingOrdersPage = lazy(() => import('@/pages/orders/ShippingOrdersPage'))
const DeliveredOrdersPage = lazy(() => import('@/pages/orders/DeliveredOrdersPage'))
const CancelledOrdersPage = lazy(() => import('@/pages/orders/CancelledOrdersPage'))

// Other
const StockPage = lazy(() => import('@/pages/stock/StockPage'))
const UsersPage = lazy(() => import('@/pages/users/UsersPage'))
const RolesPage = lazy(() => import('@/pages/roles/RolesPage'))
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading page...</p>
      </div>
    </div>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Products */}
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="products/categories-brands" element={<CategoriesBrandsPage />} />

            {/* Orders */}
            <Route path="orders" element={<OrderListPage />} />
            <Route path="orders/pending" element={<PendingOrdersPage />} />
            <Route path="orders/preparing" element={<PreparingOrdersPage />} />
            <Route path="orders/shipping" element={<ShippingOrdersPage />} />
            <Route path="orders/delivered" element={<DeliveredOrdersPage />} />
            <Route path="orders/cancelled" element={<CancelledOrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />

            {/* Other */}
            <Route path="stock" element={<StockPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
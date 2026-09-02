import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ProtectedRoute from './ProtectedRoute'
import CustomerRoute from './CustomerRoute'

// ─── Layouts ──────────────────────────────────────────────────────────────
import AdminLayout from '@/layouts/AdminLayout'
import StorefrontLayout from '@/layouts/StorefrontLayout'

// ─── Admin auth ───────────────────────────────────────────────────────────
import LoginPage from '@/pages/auth/LoginPage'

// ─── Storefront pages (eager — they are the default entry point) ──────────
import HomePage from '@/pages/store/HomePage'
import ShopPage from '@/pages/store/ShopPage'
import ProductDetailPage from '@/pages/store/ProductDetailPage'
import CartPage from '@/pages/store/CartPage'
import CheckoutPage from '@/pages/store/CheckoutPage'
import CustomerLoginPage from '@/pages/store/CustomerLoginPage'
import AccountPage from '@/pages/store/AccountPage'
import ProfilePage from '@/pages/store/ProfilePage'
import OrderHistoryPage from '@/pages/store/OrderHistoryPage'
import OrderDetailCustomerPage from '@/pages/store/OrderDetailCustomerPage'
import FavoritesPage from '@/pages/store/FavoritesPage'
import AddressesPage from '@/pages/store/AddressesPage'

// ─── Admin pages (lazy) ───────────────────────────────────────────────────
const DashboardPage         = lazy(() => import('@/pages/dashboard/DashboardPage'))
const ProductListPage       = lazy(() => import('@/pages/products/ProductListPage'))
const ProductFormPage       = lazy(() => import('@/pages/products/ProductFormPage'))
const CategoriesBrandsPage  = lazy(() => import('@/pages/products/CategoriesBrandsPage'))
const OrderListPage         = lazy(() => import('@/pages/orders/OrderListPage'))
const OrderDetailPage       = lazy(() => import('@/pages/orders/OrderDetailPage'))
const PendingOrdersPage     = lazy(() => import('@/pages/orders/PendingOrdersPage'))
const PreparingOrdersPage   = lazy(() => import('@/pages/orders/PreparingOrdersPage'))
const ShippingOrdersPage    = lazy(() => import('@/pages/orders/ShippingOrdersPage'))
const DeliveredOrdersPage   = lazy(() => import('@/pages/orders/DeliveredOrdersPage'))
const CancelledOrdersPage   = lazy(() => import('@/pages/orders/CancelledOrdersPage'))
const StockPage             = lazy(() => import('@/pages/stock/StockPage'))
const UsersPage             = lazy(() => import('@/pages/users/UsersPage'))
const RolesPage             = lazy(() => import('@/pages/roles/RolesPage'))
const ReportsPage           = lazy(() => import('@/pages/reports/ReportsPage'))
const SettingsPage          = lazy(() => import('@/pages/settings/SettingsPage'))
const AdminProfilePage      = lazy(() => import('@/pages/profile/ProfilePage'))
const NotificationsPage     = lazy(() => import('@/pages/notifications/NotificationsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ───────────────────────────────────────────────────
              STOREFRONT — public & customer routes
          ─────────────────────────────────────────────────── */}
          <Route element={<StorefrontLayout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="shop/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="login" element={<CustomerLoginPage />} />

            {/* Customer account pages — require login */}
            <Route path="account" element={<CustomerRoute><AccountPage /></CustomerRoute>}>
              <Route index element={<ProfilePage />} />
              <Route path="orders" element={<OrderHistoryPage />} />
              <Route path="orders/:id" element={<OrderDetailCustomerPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="addresses" element={<AddressesPage />} />
            </Route>
          </Route>

          {/* ───────────────────────────────────────────────────
              ADMIN PANEL — /admin/* routes
          ─────────────────────────────────────────────────── */}

          {/* Admin login at /admin (public) */}
          <Route path="admin" element={<LoginPage />} />

          {/* Protected admin layout */}
          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="products/categories-brands" element={<CategoriesBrandsPage />} />
            <Route path="orders" element={<OrderListPage />} />
            <Route path="orders/pending" element={<PendingOrdersPage />} />
            <Route path="orders/preparing" element={<PreparingOrdersPage />} />
            <Route path="orders/shipping" element={<ShippingOrdersPage />} />
            <Route path="orders/delivered" element={<DeliveredOrdersPage />} />
            <Route path="orders/cancelled" element={<CancelledOrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>

          {/* Catch-all → homepage */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

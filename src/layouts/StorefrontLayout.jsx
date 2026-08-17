import { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Search, Menu, X, Heart, ChevronDown, Package, LogOut, ShoppingBag, MapPin, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/context/CartContext'

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  { label: 'Deals', path: '/shop?sort=discount' },
  { label: 'New Arrivals', path: '/shop?sort=new' },
]

export default function StorefrontLayout() {
  const { user, logout, isAuthenticated } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const isCustomer = user?.role === 'customer'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top announcement bar */}
      <div className="bg-slate-900 text-white text-center text-xs py-2 px-4">
        🚀 Free shipping on orders over ₺500 &nbsp;|&nbsp; <span className="text-yellow-400 font-semibold">Use code WELCOME10 for 10% off</span>
      </div>

      {/* Main Navbar */}
      <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 hidden sm:block tracking-tight">
              Shop<span className="text-indigo-600">Now</span>
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center bg-gray-100 rounded-xl overflow-hidden border border-gray-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-700 placeholder-gray-400 outline-none"
            />
            <button type="submit" className="px-4 py-2.5 text-gray-500 hover:text-indigo-600 transition-colors">
              <Search size={18} />
            </button>
          </form>

          {/* Right side icons */}
          <div className="flex items-center gap-1">
            {/* Wishlist */}
            {isAuthenticated && isCustomer && (
              <Link to="/account/favorites" className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group">
                <Heart size={22} className="text-gray-600 group-hover:text-rose-500 transition-colors" />
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors group">
              <ShoppingCart size={22} className="text-gray-600 group-hover:text-indigo-600 transition-colors" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen(v => !v)}
                className="flex items-center gap-1.5 p-2.5 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  {isAuthenticated
                    ? <span className="text-indigo-700 text-sm font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                    : <User size={18} className="text-gray-600" />
                  }
                </div>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 overflow-hidden">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                      </div>
                      {isCustomer && (
                        <>
                          <Link to="/account" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                            <User size={15} /> My Account
                          </Link>
                          <Link to="/account/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                            <Package size={15} /> My Orders
                          </Link>
                          <Link to="/account/favorites" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                            <Heart size={15} /> Wishlist
                          </Link>
                          <Link to="/account/addresses" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                            <MapPin size={15} /> Addresses
                          </Link>
                        </>
                      )}
                      <div className="border-t border-gray-100 mt-1">
                        <button onClick={() => { logout(); setAccountOpen(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors font-semibold">
                        <User size={15} /> Sign In
                      </Link>
                      <Link to="/login?tab=register" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                        <Settings size={15} /> Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(v => !v)} className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors lg:hidden">
              {menuOpen ? <X size={22} className="text-gray-600" /> : <Menu size={22} className="text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Category Nav bar */}
        <div className="bg-gray-50 border-t border-gray-100">
          <nav className="max-w-screen-xl mx-auto px-4 py-2 hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${location.pathname === link.path ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu */}
          {menuOpen && (
            <nav className="max-w-screen-xl mx-auto px-4 pb-3 flex flex-col gap-1 lg:hidden">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 mt-16">
        <div className="max-w-screen-xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <ShoppingBag size={16} className="text-white" />
              </div>
              <span className="text-white font-black text-lg">Shop<span className="text-indigo-400">Now</span></span>
            </div>
            <p className="text-xs leading-relaxed">Your premium shopping destination for the latest products at the best prices.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Shop</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?sort=new" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link to="/shop?sort=discount" className="hover:text-white transition-colors">Deals & Offers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Account</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/account/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link to="/account/favorites" className="hover:text-white transition-colors">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Help</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white transition-colors cursor-pointer">Shipping Info</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Returns</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Contact Us</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 text-center text-xs py-4">
          © 2026 ShopNow. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

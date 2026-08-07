import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Package, ShoppingCart, Users, X, ArrowRight, Loader } from 'lucide-react'
import api from '@/services/api'

function highlight(text, query) {
  if (!query || !text) return text || ''
  const str = String(text)
  const idx = str.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return str
  return (
    <>
      {str.slice(0, idx)}
      <mark className="bg-indigo-100 text-indigo-800 rounded px-0.5">{str.slice(idx, idx + query.length)}</mark>
      {str.slice(idx + query.length)}
    </>
  )
}

export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ orders: [], products: [], users: [] })
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults({ orders: [], products: [], users: [] })
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Global Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) onClose()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults({ orders: [], products: [], users: [] })
      return
    }
    setLoading(true)
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
        api.get('/api/orders/admin', { params: { page: 1, page_size: 4 } }),
        api.get('/api/products', { params: { search: q, page: 1, page_size: 4 } }),
        api.get('/api/admin/users', { params: { search: q, page: 1, page_size: 3 } }),
      ])
      setResults({
        orders: ordersRes.status === 'fulfilled' ? (ordersRes.value.data.data?.items || []).slice(0, 4) : [],
        products: productsRes.status === 'fulfilled' ? (productsRes.value.data.data?.items || []).slice(0, 4) : [],
        users: usersRes.status === 'fulfilled' ? (usersRes.value.data.data?.items || []).slice(0, 3) : [],
      })
    } catch {
      setResults({ orders: [], products: [], users: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(t)
  }, [query, doSearch])

  const goTo = (path) => { navigate(path); onClose() }

  const hasResults = results.orders.length || results.products.length || results.users.length

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200/80 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          {loading
            ? <Loader size={18} className="text-slate-400 animate-spin flex-shrink-0" />
            : <Search size={18} className="text-slate-400 flex-shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Sipariş, ürün veya kullanıcı ara..."
            className="flex-1 text-sm text-slate-900 placeholder-slate-400 outline-none bg-transparent"
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">ESC</span>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query && (
            <div className="px-4 py-8 text-center text-slate-400 text-sm">
              <Search size={32} className="mx-auto mb-2 opacity-30" />
              Arama yapmak için yazmaya başlayın
            </div>
          )}

          {query && !hasResults && !loading && (
            <div className="px-4 py-8 text-center text-slate-400 text-sm">
              <Search size={32} className="mx-auto mb-2 opacity-30" />
              "{query}" için sonuç bulunamadı
            </div>
          )}

          {results.orders.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Siparişler</p>
              {results.orders.map(order => (
                <button
                  key={order.id}
                  onClick={() => goTo(`/orders/${order.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart size={14} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">{highlight(order.order_number || `#${order.id}`, query)}</p>
                    <p className="text-[11px] text-slate-500 truncate">{highlight(order.customer_name || order.status, query)}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300" />
                </button>
              ))}
            </div>
          )}

          {results.products.length > 0 && (
            <div className="py-2 border-t border-slate-100">
              <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ürünler</p>
              {results.products.map(product => (
                <button
                  key={product.id}
                  onClick={() => goTo(`/products/${product.id}/edit`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Package size={14} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">{highlight(product.name, query)}</p>
                    <p className="text-[11px] text-slate-500">SKU: {highlight(product.sku, query)}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300" />
                </button>
              ))}
            </div>
          )}

          {results.users.length > 0 && (
            <div className="py-2 border-t border-slate-100">
              <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kullanıcılar</p>
              {results.users.map(user => (
                <button
                  key={user.id}
                  onClick={() => goTo('/users')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                    <Users size={12} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">{highlight(user.name, query)}</p>
                    <p className="text-[11px] text-slate-500 truncate">{highlight(user.email, query)}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-400">
          <span>↩ Seç</span>
          <span>↑↓ Gezin</span>
          <span>ESC Kapat</span>
        </div>
      </div>
    </div>
  )
}

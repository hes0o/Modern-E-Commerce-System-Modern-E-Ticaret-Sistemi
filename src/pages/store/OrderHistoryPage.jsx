import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, AlertCircle } from 'lucide-react'
import api from '@/services/api'
import Badge from '@/components/common/Badge'

function formatPrice(p) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
}
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/orders/me')
        setOrders(res.data.data?.items || res.data.data || [])
      } catch { setOrders([]) } finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-2xl" />)}
    </div>
  )

  return (
    <div>
      <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><Package size={16} className="text-indigo-500" /> My Orders</h2>
      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-slate-600">No orders yet</p>
          <Link to="/shop" className="mt-3 inline-block text-sm text-indigo-600 hover:underline font-medium">Start shopping →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-indigo-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package size={18} className="text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">Sipariş #{order.id}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.created_at || order.ordered_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={order.status} />
                  <p className="text-sm font-black text-slate-900 whitespace-nowrap">{formatPrice(order.grand_total || order.total_price || order.total)}</p>
                  <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

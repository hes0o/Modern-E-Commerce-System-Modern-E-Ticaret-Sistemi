import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { orderService } from '@/services/orderService'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { XCircle, User, Eye } from 'lucide-react'

export default function CancelledOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const load = useCallback(async () => {
    setLoading(true)

    try {
      const res = await orderService.getAll({
        status: 'cancelled',
        limit: 100,
      })

      setOrders(res.items)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">İptal Edilen Siparişler</h1>
          <p className="text-slate-500">
            İptal edilen siparişlerin listesi
          </p>
        </div>

        {!loading && (
          <div className="px-3 py-2 rounded-lg bg-red-50 text-red-600 font-semibold text-sm">
            {orders.length} iptal edildi
          </div>
        )}
      </div>

      <div className="card overflow-hidden">

        {loading ? (

          <div className="divide-y divide-slate-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 flex gap-4">
                <div className="w-11 h-11 skeleton rounded-xl"></div>

                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton w-32"></div>
                  <div className="h-3 skeleton w-48"></div>
                </div>
              </div>
            ))}
          </div>

        ) : orders.length === 0 ? (

          <div className="py-20 text-center">
            <XCircle
              size={48}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-700">
              İptal edilen sipariş yok
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              İptal edilen siparişler burada görünecek.
            </p>
          </div>

        ) : (

          <div className="divide-y divide-slate-100">

            {orders.map((order) => (

              <div
                key={order.id}
                className="p-5 hover:bg-slate-50 transition-colors"
              >

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  <div className="flex items-start gap-3">

                    <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                      <XCircle
                        size={20}
                        className="text-red-600"
                      />
                    </div>

                    <div className="space-y-1">

                      <h2 className="font-bold text-slate-800">
                        {order.id}
                      </h2>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">

                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {order.customer}
                        </span>

                        <span className="font-semibold text-slate-700">
                          {formatCurrency(order.total)}
                        </span>

                      </div>

                      <p className="text-xs text-slate-400">
                        İptal Tarihi: {formatDate(order.updatedAt)}
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={() => navigate(`/admin/orders/${order.id}`, {
                                    state: {
                               from: location.pathname,
                                 },
                              })}
                    className="btn btn-secondary btn-sm flex items-center gap-2"
                  >
                    <Eye size={14} />
                    Detay
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  )
}
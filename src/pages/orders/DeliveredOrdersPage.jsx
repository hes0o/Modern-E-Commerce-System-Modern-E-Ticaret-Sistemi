import { useNavigate, useLocation } from 'react-router-dom'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { CheckCircle2, User, Package, Eye, Tag, Building2 } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { orderService } from '@/services/orderService'

export default function DeliveredOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const load = useCallback(async () => {
    setLoading(true)

    try {
      const res = await orderService.getAll({
      status: "completed",
      limit: 100,
    })

    setOrders(res.items)
  } finally {
    setLoading(false)
  }
  }, [])

    useEffect(() => {
    load()}, [load])

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teslim Edilen Siparişler</h1>
          <p className="page-subtitle">Başarıyla teslim edilmiş siparişlerin listesi</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
          <CheckCircle2 size={13} />
          {orders.length} teslim edildi
        </span>
      </div>

      <div className="card overflow-hidden">
        {orders.length === 0 ? (
          <div className="py-20 text-center">
            <CheckCircle2 size={48} className="mx-auto text-slate-300" />
            <h3 className="mt-4 font-semibold text-slate-700">Teslim edilen sipariş yok</h3>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="p-5 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={20} className="text-emerald-600" />
                    </div>
                    <div className="space-y-1.5">
                      <h2 className="font-bold text-slate-800 text-sm">{order.id}</h2>
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1"><User size={12} />{order.customer || '-'}</span>
                        <span className="font-semibold text-slate-700">{formatCurrency(order.total || 0)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs flex-wrap">
                        {order.shippingCompany && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Building2 size={11} />{order.shippingCompany}
                          </span>
                        )}
                        {order.trackingNo && (
                          <span className="flex items-center gap-1 text-indigo-700 font-mono font-semibold">
                            <Tag size={11} />{order.trackingNo}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">Teslim tarihi: {formatDate(order.updatedAt || order.createdAt || new Date())}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => navigate(`/orders/${order.id}`, {
                    state: {
                                    from: location.pathname,
                              },
                              })}
                      className="btn btn-secondary btn-sm flex items-center gap-1.5"
                    >
                      <Eye size={13} /> Detay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

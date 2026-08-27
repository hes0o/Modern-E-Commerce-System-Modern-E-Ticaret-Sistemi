import { useNavigate, useLocation } from 'react-router-dom'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Truck, User, Eye, CheckCircle2, Tag, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import CargoLabelModal from './CargoLabelModal'
import { useState, useEffect, useCallback } from 'react'
import { orderService } from '@/services/orderService'


export default function ShippingOrdersPage() {
  const [updating, setUpdating] = useState(null)
  const [cargoOrder, setCargoOrder] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const load = useCallback(async () => {
    setLoading(true)
    try {
    const res = await orderService.getAll({
      status: 'shipped',
      limit: 100
    })
    setOrders(res.items)
      } finally {
    setLoading(false)
   }
      }, [])

    useEffect(() => { load()}, [load])
  

  const handleDeliver = async (id) => {
  setUpdating(id)

  try {
    await orderService.updateStatus(id, "completed")
    toast.success("Sipariş teslim edildi.")
    await load()
  } catch {
    toast.error("İşlem başarısız.")
  } finally {
    setUpdating(null)
  }
}

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kargodaki Siparişler</h1>
          <p className="page-subtitle">Kargoya verilmiş ve teslim bekleyen siparişler</p>
        </div>
        {!loading && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
            <Truck size={13} />
            {orders.length} kargoda
          </span>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 flex gap-4">
                <div className="w-11 h-11 skeleton rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2"><div className="h-4 skeleton w-32" /><div className="h-3 skeleton w-48" /></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <Truck size={48} className="mx-auto text-slate-300" />
            <h3 className="mt-4 font-semibold text-slate-700">Kargoda sipariş yok</h3>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => {
              const isUpdating = updating === order.id
              return (
                <div key={order.id} className="p-5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Truck size={20} className="text-purple-600" />
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
                        <p className="text-xs text-slate-400">Kargo tarihi: {formatDate(order.updatedAt || order.createdAt || new Date())}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`, {
                                state: {
                                          from: location.pathname,
                                },
                    })}
                        className="btn btn-secondary btn-sm flex items-center gap-1.5"
                      >
                        <Eye size={13} /> Detay
                      </button>
                      <button
                        onClick={() => setCargoOrder(order)}
                        className="btn btn-secondary btn-sm"
                      >
                        Etiket
                      </button>
                      <button
                        onClick={() => handleDeliver(order.id)}
                        disabled={isUpdating}
                        className="btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600 flex items-center gap-1.5 disabled:opacity-60"
                      >
                        <CheckCircle2 size={13} />
                        {isUpdating ? '...' : 'Teslim Edildi'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <CargoLabelModal order={cargoOrder} onClose={() => setCargoOrder(null)} />
    </div>
  )
}

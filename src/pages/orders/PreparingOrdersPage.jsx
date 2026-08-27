import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { orderService } from '@/services/orderService'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Clock, User, Package, Eye, Truck, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import CargoLabelModal from './CargoLabelModal'

export default function PreparingOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [cargoOrder, setCargoOrder] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await orderService.getAll({ status: 'preparing', limit: 100 })
      setOrders(res.items)
    } catch {
      toast.error('Siparişler yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

 const handleSendToCargo = async (order) => {
  setUpdating(order.id)

  try {
    await orderService.updateStatus(order.id, "shipped")

    const result = await orderService.getAll({
      status: "shipped",
      limit: 100,
    })

    console.log(result)

    toast.success(`${order.id} kargoya verildi.`)

    await load()
  } catch (err) {
    console.error(err)
    toast.error("İşlem başarısız.")
  } finally {
    setUpdating(null)
  }
}

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hazırlanan Siparişler</h1>
          <p className="page-subtitle">Onaylanan ve hazırlık aşamasındaki siparişler</p>
        </div>
        {!loading && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            <Package size={13} />
            {orders.length} sipariş hazırlanıyor
          </span>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 flex gap-4">
                <div className="w-11 h-11 skeleton rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton w-32" />
                  <div className="h-3 skeleton w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={48} className="mx-auto text-slate-300" />
            <h3 className="mt-4 font-semibold text-slate-700">Hazırlanan sipariş yok</h3>
            <p className="text-sm text-slate-500 mt-2">Onaylanan siparişler burada görünecek.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => {
              const isUpdating = updating === order.id
              return (
                <div key={order.id} className="p-5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <Package size={20} className="text-yellow-600" />
                      </div>
                      <div className="space-y-1.5">
                        <h2 className="font-bold text-slate-800 text-sm">{order.id}</h2>
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1"><User size={12} />{order.customer}</span>
                          <span>{order.items?.length || 0} kalem</span>
                          <span className="font-semibold text-slate-700">{formatCurrency(order.total)}</span>
                        </div>
                        <p className="text-xs text-slate-400">{formatDate(order.orderedAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-100 text-yellow-700 text-xs font-semibold">
                        <Clock size={12} /> Hazırlanıyor
                      </span>
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
                        className="btn btn-secondary btn-sm flex items-center gap-1.5"
                      >
                        <Printer size={13} /> Etiket
                      </button>
                      <button
                        onClick={() => handleSendToCargo(order)}
                        disabled={isUpdating}
                        className="btn btn-sm bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600 flex items-center gap-1.5 disabled:opacity-60"
                      >
                        <Truck size={13} />
                        {isUpdating ? '...' : 'Kargoya Ver'}
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

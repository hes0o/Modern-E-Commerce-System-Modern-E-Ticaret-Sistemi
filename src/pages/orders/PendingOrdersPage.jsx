import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { orderService } from '@/services/orderService'
import { formatCurrency, formatDate } from '@/utils/formatters'
import Badge from '@/components/common/Badge'
import { Clock, User, Package, Eye, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

function getWaitingInfo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000 / 60 / 60)
  if (diff < 2) return { text: `${diff < 1 ? '<1' : diff} saat`, color: 'bg-emerald-100 text-emerald-700', urgent: false }
  if (diff < 24) return { text: `${diff} saat`, color: 'bg-amber-100 text-amber-700', urgent: false }
  return { text: `${Math.floor(diff / 24)} gün`, color: 'bg-red-100 text-red-700', urgent: true }
}

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null) // orderId being updated
  const navigate = useNavigate()
  const location = useLocation()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await orderService.getAll({ status: 'pending', limit: 100 })
      setOrders(res.items)
    } catch {
      toast.error('Siparişler yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    document.title = orders.length > 0 ? `(${orders.length}) Admin Panel` : 'Admin Panel'
    return () => { document.title = 'Admin Panel' }
  }, [orders.length])

  const handleApprove = async (id) => {
    setUpdating(id)
    try {
      await orderService.updateStatus(id, 'processing')
      toast.success('Sipariş onaylandı ve hazırlık aşamasına alındı.')
      await load()
    } catch {
      toast.error('İşlem başarısız.')
    } finally {
      setUpdating(null)
    }
  }

  const handleCancel = async (id) => {
    setUpdating(id)
    try {
      await orderService.updateStatus(id, 'cancelled')
      toast.success('Sipariş iptal edildi.')
      await load()
    } catch {
      toast.error('İşlem başarısız.')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Onay Bekleyen Siparişler</h1>
          <p className="page-subtitle">Yeni gelen ve onay bekleyen tüm siparişler</p>
        </div>
        {!loading && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
            <Clock size={13} />
            {orders.length} sipariş bekliyor
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
            <h3 className="mt-4 font-semibold text-slate-700">Bekleyen sipariş yok</h3>
            <p className="text-sm text-slate-500 mt-2">Yeni sipariş geldiğinde burada görünecek.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => {
              const waiting = getWaitingInfo(order.orderedAt)
              const isUpdating = updating === order.id
              return (
                <div key={order.id} className="p-5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left */}
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Package size={20} className="text-indigo-600" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-bold text-slate-800 text-sm">{order.id}</h2>
                          {waiting.urgent && <AlertTriangle size={14} className="text-red-500" />}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1"><User size={12} />{order.customer}</span>
                          <span>{order.items?.length || 0} kalem</span>
                          <span className="font-semibold text-slate-700">{formatCurrency(order.total)}</span>
                        </div>
                        <p className="text-xs text-slate-400">{formatDate(order.orderedAt)}</p>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${waiting.color}`}>
                        <Clock size={12} />
                        {waiting.text} bekliyor
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/orders/${order.id}`, {
                          state: {from: location.pathname,},})}
                          className="btn btn-secondary btn-sm flex items-center gap-1.5"
                        >
                          <Eye size={13} /> Detay
                        </button>
                        <button
                          onClick={() => handleApprove(order.id)}
                          disabled={isUpdating}
                          className="btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600 flex items-center gap-1.5 disabled:opacity-60"
                        >
                          <CheckCircle2 size={13} />
                          {isUpdating ? '...' : 'Onayla'}
                        </button>
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={isUpdating}
                          className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 flex items-center gap-1.5 disabled:opacity-60"
                        >
                          <XCircle size={13} />
                          İptal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

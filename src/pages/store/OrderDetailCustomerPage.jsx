import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Package, ArrowLeft, Truck, Tag, Clock, CheckCircle2, XCircle } from 'lucide-react'
import api from '@/services/api'

const STATUS_CONFIG = {
  pending:    { label: 'Beklemede',     color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed:  { label: 'Onaylandı',    color: 'bg-teal-100 text-teal-700',    icon: CheckCircle2 },
  preparing:  { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-700',    icon: Package },
  shipped:    { label: 'Kargoda',      color: 'bg-purple-100 text-purple-700', icon: Truck },
  completed:  { label: 'Tamamlandı',   color: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  cancelled:  { label: 'İptal Edildi', color: 'bg-red-100 text-red-700',      icon: XCircle },
}

function formatPrice(p) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
}
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function OrderDetailCustomerPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/api/orders/me/${id}`)
        setOrder(res.data.data)
      } catch { /* not found */ } finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
      <div className="h-8 bg-gray-100 animate-pulse rounded-xl w-48" />
      <div className="h-48 bg-gray-100 animate-pulse rounded-2xl" />
      <div className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
    </div>
  )

  if (!order) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
      <Package size={48} className="mx-auto text-gray-300" />
      <p className="font-semibold text-slate-600">Sipariş bulunamadı.</p>
      <Link to="/account/orders" className="text-sm text-indigo-600 hover:underline">Siparişlerime Dön</Link>
    </div>
  )

  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const StatusIcon = statusCfg.icon
  const items = order.items || []
  const subtotal = order.subtotal || order.sub_total || 0
  const tax = order.vat_total || order.tax || 0
  const total = order.grand_total || order.total || 0
  const trackingNo = order.shipping_tracking_number
  const timeline = order.status_history || []

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/account/orders" className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all bg-white">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-lg font-black text-slate-900">Sipariş #{order.id}</h1>
          <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
        </div>
        <span className={`ml-auto text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${statusCfg.color}`}>
          <StatusIcon size={13} />
          {statusCfg.label}
        </span>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-slate-900">Sipariş Edilen Ürünler ({items.length})</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package size={20} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {item.product_name_snapshot || item.product_name || `Ürün #${item.product_id}`}
                </p>
                <p className="text-xs text-gray-400">x{item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-slate-900 whitespace-nowrap">
                {formatPrice(item.line_total || item.unit_price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        {/* Totals */}
        <div className="border-t border-gray-100 px-5 py-4 space-y-1.5 bg-gray-50/60">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Ara Toplam</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>KDV</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Kargo</span>
            <span>Ücretsiz</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-gray-200 pt-2 mt-1">
            <span>Toplam</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Tracking */}
      {trackingNo && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Truck size={18} className="text-indigo-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Kargo Takip Numarası</p>
            <p className="text-sm font-mono font-bold text-indigo-700 mt-0.5">{trackingNo}</p>
          </div>
          <Tag size={16} className="text-gray-300 ml-auto" />
        </div>
      )}

      {/* Status Timeline */}
      {timeline.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Sipariş Geçmişi</h2>
          <div className="space-y-0">
            {timeline.map((step, idx) => {
              const cfg = STATUS_CONFIG[step.new_status] || STATUS_CONFIG.pending
              const Icon = cfg.icon
              const isLast = idx === timeline.length - 1
              return (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${step.new_status === 'cancelled' ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-600'}`}>
                      <Icon size={13} />
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{cfg.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(step.created_at)}</p>
                    {step.note && <p className="text-xs text-gray-500 mt-0.5 italic">"{step.note}"</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Customer note */}
      {order.customer_note && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-700 mb-1">Siparişinizdeki Notunuz</p>
          <p className="text-sm text-slate-700">{order.customer_note}</p>
        </div>
      )}
    </div>
  )
}

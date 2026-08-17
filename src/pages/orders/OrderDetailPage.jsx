import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import Badge from '@/components/common/Badge'
import { orderService } from '@/services/orderService'
import { formatCurrency, formatDate } from '@/utils/formatters'
import {
  ArrowLeft, User, MapPin, CreditCard, Clock, CheckCircle2, Truck,
  Package, Phone, Mail, XCircle, Printer, Tag, Building2
} from 'lucide-react'
import toast from 'react-hot-toast'
import CargoLabelModal from './CargoLabelModal'

const STATUS_CONFIG = {
  pending:    { label: 'Beklemede',     color: 'yellow',  icon: Clock },
  processing: { label: 'Hazırlanıyor',  color: 'blue',    icon: Package },
  shipped:    { label: 'Kargoda',       color: 'purple',  icon: Truck },
  delivered:  { label: 'Teslim Edildi', color: 'green',   icon: CheckCircle2 },
  cancelled:  { label: 'İptal Edildi',  color: 'red',     icon: XCircle },
}

const STATUS_PIPELINE = ['pending', 'processing', 'shipped', 'delivered']

function StatusTimeline({ timeline, currentStatus }) {
  if (!timeline || timeline.length === 0) return null
  return (
    <div className="space-y-0">
      {timeline.map((step, idx) => {
        const cfg = STATUS_CONFIG[step.status] || {}
        const Icon = cfg.icon || CheckCircle2
        const isLast = idx === timeline.length - 1
        const isCancelled = step.status === 'cancelled'
        return (
          <div key={step.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isCancelled ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                <Icon size={15} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-slate-200 my-1" />}
            </div>
            <div className={`pb-5 ${isLast ? '' : ''}`}>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{step.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{formatDate(step.date)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function NextStatusActions({ order, onStatusChange, loading }) {
  if (order.status === 'delivered' || order.status === 'cancelled') return null

  const currentIdx = STATUS_PIPELINE.indexOf(order.status)
  const nextStatus = STATUS_PIPELINE[currentIdx + 1]

  const actions = []

  if (nextStatus) {
    const cfg = STATUS_CONFIG[nextStatus]
    const NextIcon = cfg.icon
    actions.push(
      <button
        key={nextStatus}
        onClick={() => onStatusChange(nextStatus)}
        disabled={loading}
        className="btn btn-brand flex items-center gap-2"
      >
        <NextIcon size={15} />
        {nextStatus === 'processing' && 'Hazırlamaya Al'}
        {nextStatus === 'shipped' && 'Kargoya Ver'}
        {nextStatus === 'delivered' && 'Teslim Edildi Olarak İşaretle'}
      </button>
    )
  }

  if (order.status !== 'cancelled') {
    actions.push(
      <button
        key="cancel"
        onClick={() => onStatusChange('cancelled')}
        disabled={loading}
        className="btn btn-danger flex items-center gap-2"
      >
        <XCircle size={15} />
        İptal Et
      </button>
    )
  }

  return <div className="flex flex-wrap items-center gap-2">{actions}</div>
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [cargoModalOpen, setCargoModalOpen] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await orderService.getById(id)
        setOrder(res)
      } catch (err) {
        console.error(err)
        toast.error('Sipariş yüklenemedi.')
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [id])

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    try {
      const updated = await orderService.updateStatus(id, newStatus)
      setOrder(updated)
      const cfg = STATUS_CONFIG[newStatus]
      toast.success(`Sipariş durumu "${cfg?.label}" olarak güncellendi.`)
    } catch (err) {
      toast.error('Durum güncellenemedi.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 skeleton w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 h-64 skeleton" />
            <div className="card p-6 h-48 skeleton" />
          </div>
          <div className="card p-6 h-64 skeleton" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16 space-y-4">
        <Package size={48} className="mx-auto text-slate-300" />
        <p className="text-slate-500 font-medium">Sipariş bulunamadı.</p>
        <Link to="/admin/orders" className="btn btn-secondary">Siparişlere Dön</Link>
      </div>
    )
  }

  const cfg = STATUS_CONFIG[order.status] || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(location.state?.from || "/orders")}
            className="btn btn-secondary p-2">
              <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="page-title">{order.id}</h1>
              <Badge status={order.status} />
            </div>
            <p className="page-subtitle">Sipariş tarihi: {formatDate(order.orderedAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {order.trackingNo && (
            <button
              onClick={() => setCargoModalOpen(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Printer size={15} />
              Kargo Etiketi
            </button>
          )}
          <NextStatusActions order={order} onStatusChange={handleStatusChange} loading={updating} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Sipariş Edilen Ürünler ({order.items?.length || 0})
            </h3>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Birim Fiyat</th>
                    <th>Adet</th>
                    <th className="text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold text-slate-800">{item.product}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td>x{item.quantity}</td>
                      <td className="text-right font-bold text-slate-800">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-slate-100 pt-4 space-y-2 max-w-xs ml-auto text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Ara Toplam</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>KDV (%18)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Kargo</span>
                <span>{order.shipping === 0 ? 'Ücretsiz' : formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 text-base border-t border-slate-100 pt-2">
                <span>Genel Toplam</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Sipariş Zaman Çizelgesi
            </h3>
            <StatusTimeline timeline={order.timeline} currentStatus={order.status} />
          </div>

          {/* Shipping Info (if shipped/delivered) */}
          {(order.status === 'shipped' || order.status === 'delivered') && order.shippingCompany && (
            <div className="card p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Truck size={18} className="text-indigo-500" /> Kargo Bilgileri
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Building2 size={18} className="text-slate-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Kargo Şirketi</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{order.shippingCompany}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tag size={18} className="text-slate-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Takip Numarası</p>
                    <p className="text-sm font-mono font-bold text-indigo-700 mt-0.5">{order.trackingNo || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="card p-5 border-l-4 border-amber-400 bg-amber-50/40">
              <p className="text-xs font-bold text-amber-700 mb-1">Müşteri Notu</p>
              <p className="text-sm text-slate-700">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Right Col - Customer & Payment Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Müşteri Bilgileri
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={18} className="text-slate-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{order.customer}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-slate-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-500">E-posta</p>
                  <a href={`mailto:${order.email}`} className="text-sm text-indigo-600 hover:underline mt-0.5 block">{order.email}</a>
                </div>
              </div>
              {order.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-slate-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Telefon</p>
                    <a href={`tel:${order.phone}`} className="text-sm text-slate-700 hover:underline mt-0.5 block">{order.phone}</a>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-slate-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-500">Teslimat Adresi</p>
                  <p className="text-sm text-slate-700 mt-0.5">{order.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Ödeme Bilgileri
            </h3>
            <div className="flex items-start gap-3">
              <CreditCard size={18} className="text-slate-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500">Ödeme Yöntemi</p>
                <p className="text-sm text-slate-700 mt-0.5">
                  {order.paymentMethod === 'Credit Card' ? 'Kredi Kartı' : order.paymentMethod}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Ürünler</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>KDV</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Kargo</span>
                <span>{order.shipping === 0 ? 'Ücretsiz' : formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-800 border-t border-slate-200 pt-1.5 mt-1">
                <span>Toplam</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Quick Status Change */}
          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Hızlı Durum Değişikliği</h3>
            <select
              value={order.status}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="select text-xs"
            >
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cargo Label Modal */}
      <CargoLabelModal
        order={cargoModalOpen ? order : null}
        onClose={() => setCargoModalOpen(false)}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Badge from '@/components/common/Badge'
import { orderService } from '@/services/orderService'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { ArrowLeft, User, MapPin, CreditCard, Clock, CheckCircle2 } from 'lucide-react'

const STATUS_LABELS = {
  pending: 'Beklemede',
  processing: 'Hazırlanıyor',
  shipped: 'Kargoda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await orderService.getById(id)
        setOrder(res)
      } catch (err) {
        console.error(err)
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
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-500 font-medium">Sipariş bulunamadı.</p>
        <Link to="/orders" className="btn btn-secondary">
          Siparişlere Dön
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/orders" className="btn btn-secondary btn-sm p-2">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">{order.id}</h1>
              <Badge status={order.status} />
            </div>
            <p className="page-subtitle">Sipariş tarihi: {formatDate(order.orderedAt)}</p>
          </div>
        </div>

        {/* Update Status Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Durumu Değiştir:</span>
          <select
            value={order.status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="select w-44 text-xs py-1.5"
          >
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols - Items & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Sipariş Edilen Ürünler ({order.items.length})
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
                  {order.items.map((item, idx) => (
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
                <span>KDV (%20)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Kargo KDV dahil</span>
                <span>{order.shipping === 0 ? 'Ücretsiz' : formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 text-base border-t border-slate-100 pt-2">
                <span>Genel Toplam</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Sipariş Zaman Çizelgesi
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-emerald-50 text-emerald-600 mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Sipariş Alındı</p>
                  <p className="text-xs text-slate-400">{formatDate(order.orderedAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-blue-50 text-blue-600 mt-0.5">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Durum Güncellendi: {STATUS_LABELS[order.status] || order.status}</p>
                  <p className="text-xs text-slate-400">{formatDate(order.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Customer Info */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Müşteri Bilgileri
            </h3>

            <div className="flex items-start gap-3">
              <User size={18} className="text-slate-400 mt-1" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{order.customer}</p>
                <p className="text-xs text-slate-500">{order.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <MapPin size={18} className="text-slate-400 mt-1" />
              <div>
                <p className="text-xs font-semibold text-slate-500">Teslimat Adresi</p>
                <p className="text-sm text-slate-700 mt-0.5">{order.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <CreditCard size={18} className="text-slate-400 mt-1" />
              <div>
                <p className="text-xs font-semibold text-slate-500">Ödeme Yöntemi</p>
                <p className="text-sm text-slate-700 mt-0.5">{order.paymentMethod === 'Credit Card' ? 'Kredi Kartı' : order.paymentMethod}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

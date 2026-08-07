import { X, Printer, Building2, Tag, User, Phone, Mail, MapPin, Package } from 'lucide-react'
import Barcode from 'react-barcode'
import { formatDate, formatCurrency } from '@/utils/formatters'

export default function CargoLabelModal({ order, onClose }) {
  if (!order) return null

  const trackingValue = order.trackingNo || order.id

  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">Kargo Etiketi</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Label Preview */}
        <div className="p-6">
          <div
            id="cargo-label"
            className="border-2 border-dashed border-slate-300 rounded-xl p-5 bg-white space-y-4"
          >
            {/* Barcode */}
            <div className="flex justify-center">
              <Barcode
                value={trackingValue}
                width={1.5}
                height={60}
                fontSize={11}
                margin={0}
              />
            </div>

            {/* Cargo Company & Tracking */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Building2 size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kargo</p>
                  <p className="text-xs font-bold text-slate-800">{order.shippingCompany || 'Belirtilmemiş'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Tag size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Takip No</p>
                  <p className="text-xs font-mono font-bold text-indigo-700">{trackingValue}</p>
                </div>
              </div>
            </div>

            {/* Recipient */}
            <div className="border border-slate-200 rounded-lg p-3 space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alıcı Bilgileri</p>
              <div className="flex items-center gap-2">
                <User size={13} className="text-slate-400 flex-shrink-0" />
                <p className="text-sm font-bold text-slate-800">{order.customer}</p>
              </div>
              {order.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-slate-400 flex-shrink-0" />
                  <p className="text-xs text-slate-700">{order.phone}</p>
                </div>
              )}
              {order.email && (
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-slate-400 flex-shrink-0" />
                  <p className="text-xs text-slate-700">{order.email}</p>
                </div>
              )}
              <div className="flex items-start gap-2 mt-1">
                <MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-700">{order.address}</p>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sipariş Detayı</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Package size={12} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">{order.id}</span>
                </div>
                <span className="text-xs font-bold text-slate-800">{formatCurrency(order.total)}</span>
              </div>
              <p className="text-[10px] text-slate-500">
                {order.items?.length || 0} kalem ürün • {formatDate(order.orderedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 btn btn-brand flex items-center justify-center gap-2"
          >
            <Printer size={15} />
            Yazdır
          </button>
          <button onClick={onClose} className="flex-1 btn btn-secondary">
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}
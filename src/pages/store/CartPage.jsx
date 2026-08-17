import { useCart } from '@/context/CartContext'
import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight, Tag, Package } from 'lucide-react'
import toast from 'react-hot-toast'

function formatPrice(p) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
}

export default function CartPage() {
  const { cart, loading, itemCount, total, updateItem, removeItem } = useCart()
  const items = cart?.items || []

  if (loading) return (
    <div className="max-w-screen-lg mx-auto px-4 py-12">
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-2xl" />)}
      </div>
    </div>
  )

  if (itemCount === 0) return (
    <div className="max-w-screen-lg mx-auto px-4 py-24 text-center">
      <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <ShoppingBag size={40} className="text-indigo-300" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
      <Link to="/shop" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5">
        Start Shopping <ArrowRight size={18} />
      </Link>
    </div>
  )

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-slate-900 mb-6">Shopping Cart <span className="text-gray-400 text-lg font-normal">({itemCount} items)</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex gap-4 hover:border-indigo-100 transition-all">
              {/* Image */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={24} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">{item.product_name}</h3>
                {item.variant_sku && <p className="text-xs text-gray-400 mt-0.5">{item.variant_sku}</p>}
                <p className="text-base font-black text-indigo-600 mt-1">{formatPrice(item.unit_price)}</p>
              </div>

              {/* Qty + Remove */}
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={async () => { await removeItem(item.id); toast.success('Removed from cart') }}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                    className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 transition-colors text-sm font-bold">−</button>
                  <span className="px-3 py-1 text-sm font-semibold text-slate-900">{item.quantity}</span>
                  <button onClick={() => updateItem(item.id, item.quantity + 1)}
                    className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 transition-colors text-sm font-bold">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 mb-4">Order Summary</h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={`font-semibold ${total >= 500 ? 'text-emerald-600' : ''}`}>
                  {total >= 500 ? 'FREE' : formatPrice(29.99)}
                </span>
              </div>
              {total < 500 && (
                <p className="text-xs text-gray-400 bg-indigo-50 rounded-lg px-3 py-2">
                  Add {formatPrice(500 - total)} more for free shipping!
                </p>
              )}
              <div className="border-t border-gray-100 pt-2.5 flex justify-between font-black text-slate-900 text-base">
                <span>Total</span>
                <span>{formatPrice(total >= 500 ? total : total + 29.99)}</span>
              </div>
            </div>

            {/* Promo code */}
            <div className="mt-4 flex gap-2">
              <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 gap-2">
                <Tag size={14} className="text-gray-400" />
                <input type="text" placeholder="Promo code" className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-gray-400" />
              </div>
              <button className="px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">Apply</button>
            </div>

            <Link to="/checkout"
              className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5 text-sm">
              Proceed to Checkout <ArrowRight size={16} />
            </Link>

            <Link to="/shop" className="mt-3 w-full flex items-center justify-center text-sm text-gray-500 hover:text-indigo-600 transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

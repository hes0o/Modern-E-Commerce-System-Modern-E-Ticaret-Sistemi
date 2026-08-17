import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/hooks/useAuth'
import { addressService } from '@/services/addressService'
import { MapPin, CreditCard, Check, Package, ArrowLeft, Plus } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'

function formatPrice(p) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
}

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewAddr, setShowNewAddr] = useState(false)
  const [newAddr, setNewAddr] = useState({ title: '', recipient_name: '', phone: '', city: '', district: '', full_address: '', postal_code: '', is_default: false })

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    async function load() {
      try {
        const data = await addressService.getAll()
        setAddresses(data)
        const def = data.find(a => a.is_default) || data[0]
        if (def) setSelectedAddress(def.id)
      } catch {}
    }
    if (isAuthenticated) load()
  }, [isAuthenticated])

  async function handleSaveAddress() {
    try {
      const addr = await addressService.create(newAddr)
      setAddresses(prev => [...prev, addr])
      setSelectedAddress(addr.id)
      setShowNewAddr(false)
      toast.success('Address saved!')
    } catch { toast.error('Could not save address') }
  }

  async function handlePlaceOrder() {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return }
    setLoading(true)
    try {
      await api.post('/api/orders', {
        shipping_address_id: selectedAddress,
        billing_address_id: selectedAddress,
        payment_method: paymentMethod,
        customer_note: note,
        contract_version_accepted: 'v1',
      })
      await clearCart()
      toast.success('Order placed successfully! 🎉')
      navigate('/account/orders')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order')
    } finally { setLoading(false) }
  }

  const items = cart?.items || []
  const shipping = total >= 500 ? 0 : 29.99
  const grandTotal = total + shipping

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8">
      <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Cart
      </button>
      <h1 className="text-2xl font-black text-slate-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Delivery Address */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><MapPin size={16} className="text-indigo-500" /> Delivery Address</h2>
            {addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${selectedAddress === addr.id ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-0.5 accent-indigo-600" />
                    <div className="text-sm">
                      <p className="font-semibold text-slate-900">{addr.title} — {addr.recipient_name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{addr.full_address}, {addr.district}, {addr.city} {addr.postal_code}</p>
                      <p className="text-gray-400 text-xs">{addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-3">No saved addresses. Add one below.</p>
            )}

            {showNewAddr ? (
              <div className="mt-3 border border-dashed border-indigo-200 rounded-xl p-4 space-y-3 bg-indigo-50/40">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { f: 'title', label: 'Address Title', placeholder: 'Home, Work...' },
                    { f: 'recipient_name', label: 'Recipient Name', placeholder: 'Full name' },
                    { f: 'phone', label: 'Phone', placeholder: '+90 555 123 45 67' },
                    { f: 'city', label: 'City', placeholder: 'Istanbul' },
                    { f: 'district', label: 'District', placeholder: 'Kadıköy' },
                    { f: 'postal_code', label: 'Postal Code', placeholder: '34000' },
                  ].map(({ f, label, placeholder }) => (
                    <div key={f}>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
                      <input value={newAddr[f]} onChange={e => setNewAddr(p => ({ ...p, [f]: e.target.value }))} placeholder={placeholder}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 bg-white" />
                    </div>
                  ))}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Address</label>
                  <textarea value={newAddr.full_address} onChange={e => setNewAddr(p => ({ ...p, full_address: e.target.value }))} rows={2} placeholder="Street, building, apt..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 bg-white resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveAddress} className="flex-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all">Save Address</button>
                  <button onClick={() => setShowNewAddr(false)} className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowNewAddr(true)} className="mt-3 flex items-center gap-2 text-sm text-indigo-600 hover:underline font-semibold">
                <Plus size={15} /> Add new address
              </button>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><CreditCard size={16} className="text-indigo-500" /> Payment Method</h2>
            <div className="space-y-2">
              {[
                { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                { value: 'bank_transfer', label: 'Bank Transfer', desc: 'Transfer to our bank account' },
              ].map(({ value, label, desc }) => (
                <label key={value} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === value ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="mt-0.5 accent-indigo-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Order Note (optional)</h2>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Any special instructions for your order..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all resize-none" />
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 mb-4">Order Summary</h3>
            <div className="space-y-2.5 max-h-48 overflow-y-auto mb-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-2.5 text-xs">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                    {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : <Package size={14} className="text-gray-300 m-auto" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 line-clamp-1">{item.product_name}</p>
                    <p className="text-gray-400">×{item.quantity}</p>
                  </div>
                  <p className="font-semibold text-slate-900 flex-shrink-0">{formatPrice(item.unit_price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-emerald-600 font-semibold' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between font-black text-slate-900 text-base pt-1 border-t border-gray-100"><span>Total</span><span>{formatPrice(grandTotal)}</span></div>
            </div>
            <button onClick={handlePlaceOrder} disabled={loading || items.length === 0}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5 disabled:opacity-60 text-sm">
              <Check size={16} />
              {loading ? 'Placing order...' : 'Place Order'}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-2">By placing an order, you agree to our Terms of Service.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

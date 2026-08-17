import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, ArrowLeft, Star, Package, Check, Truck, Shield } from 'lucide-react'
import { productService } from '@/services/productService'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

function formatPrice(p) {
  if (p == null) return '—'
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p)
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await productService.getById(id)
        setProduct(data)
        if (data?.variants?.length) setSelectedVariant(data.variants[0])
      } catch { toast.error('Product not found') } finally { setLoading(false) }
    }
    load()
  }, [id])

  async function handleAddToCart() {
    setAdding(true)
    try {
      await addItem(product.id, selectedVariant?.id || null, quantity)
      toast.success('Added to cart!')
    } catch { toast.error('Could not add to cart') } finally { setAdding(false) }
  }

  if (loading) return (
    <div className="max-w-screen-xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="aspect-square bg-gray-100 animate-pulse rounded-3xl" />
      <div className="space-y-4">
        {[200, 120, 80, 100, 60].map((w, i) => (
          <div key={i} className="h-6 bg-gray-100 animate-pulse rounded-xl" style={{ width: w }} />
        ))}
      </div>
    </div>
  )

  if (!product) return (
    <div className="text-center py-24 text-gray-400">
      <Package size={48} className="mx-auto mb-4 opacity-30" />
      <p className="text-lg font-semibold text-slate-600">Product not found</p>
      <button onClick={() => navigate('/shop')} className="mt-4 text-indigo-600 hover:underline text-sm">Back to shop</button>
    </div>
  )

  const images = product.images?.length ? product.images : []
  const price = selectedVariant?.price ?? product.base_price ?? product.price ?? 0

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 mb-3">
            {images[selectedImage] ? (
              <img src={images[selectedImage].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={80} className="text-gray-200" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-indigo-500' : 'border-gray-100 hover:border-gray-300'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.brand?.name && (
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">{product.brand.name}</span>
          )}
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={16} className={i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
              ))}
            </div>
            <span className="text-sm text-gray-500">4.0 (24 reviews)</span>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-5">
            <p className="text-3xl font-black text-slate-900">{formatPrice(price)}</p>
            <p className="text-xs text-gray-400 mt-1">Including VAT. Free shipping over ₺500.</p>
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-slate-700 mb-2">Options</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <button key={v.id} onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-1.5 text-sm rounded-xl border transition-all font-medium ${selectedVariant?.id === v.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'border-gray-200 hover:border-indigo-300 text-slate-700 bg-white'}`}>
                    {v.sku || v.name || `Option ${v.id}`}
                    {v.price ? ` — ${formatPrice(v.price)}` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-3 mb-5">
            <p className="text-sm font-semibold text-slate-700">Qty</p>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors font-bold">−</button>
              <span className="px-4 py-2 text-sm font-semibold text-slate-900 border-x border-gray-100">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors font-bold">+</button>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-200 disabled:opacity-60 text-sm"
            >
              <ShoppingCart size={18} />
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-2xl hover:border-rose-300 hover:bg-rose-50 transition-all group">
              <Heart size={18} className="text-gray-400 group-hover:text-rose-500 transition-colors" />
            </button>
          </div>

          {/* Guarantees */}
          <div className="space-y-2 border-t border-gray-100 pt-5">
            {[
              { icon: Truck, text: 'Free delivery on orders over ₺500' },
              { icon: Shield, text: '2 year manufacturer warranty' },
              { icon: Check, text: '30-day hassle-free returns' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                <Icon size={15} className="text-emerald-500 flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

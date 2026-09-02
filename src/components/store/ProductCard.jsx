import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star, Package } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '@/utils/constants'

function formatPrice(p) {
  if (p == null) return '—'
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p)
}

function resolveImageUrl(path) {
  if (!path) return null

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const apiOrigin = new URL(
    API_BASE_URL,
    window.location.origin
  ).origin

  return `${apiOrigin}${path.startsWith('/') ? path : `/${path}`}`
}

export default function ProductCard({ product, onFavoriteToggle, isFavorited = false }) {
  const { addItem } = useCart()
  const { isAuthenticated, user } = useAuth()
  const [adding, setAdding] = useState(false)
  const [fav, setFav] = useState(isFavorited)

  const isCustomer = user?.role === 'customer' || !isAuthenticated

  async function handleAddToCart(e) {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    try {
      await addItem(product.id, null, 1)
      toast.success('Added to cart!')
    } catch {
      toast.error('Could not add to cart')
    } finally {
      setAdding(false)
    }
  }

  async function handleFavorite(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Sign in to save favorites')
      return
    }
    setFav(v => !v)
    onFavoriteToggle?.(product.id, !fav)
  }

  const price = product.base_price ?? product.price ?? 0
  const imagePath =
    product.images?.[0]?.url ||
    product.images?.[0]?.image_path ||
    product.image_url
  const image = resolveImageUrl(imagePath)
  const stock = product.stock ?? Infinity  // Infinity = unknown, treat as in-stock
  const isOutOfStock = stock === 0

  return (
    <Link to={`/shop/${product.id}`} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200 flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {image ? (
          <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package size={48} className="text-gray-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOutOfStock ? (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Tükendi</span>
          ) : (
            product.status === 'published' && price > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Stokta Var</span>
            )
          )}
          {product.is_new && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">YENİ</span>
          )}
        </div>

        {/* Favorite button */}
        {isCustomer && (
          <button
            onClick={handleFavorite}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          >
            <Heart size={15} className={fav ? 'text-rose-500 fill-rose-500' : 'text-gray-400'} />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-1">
        {product.brand?.name && (
          <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-0.5">{product.brand.name}</p>
        )}
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug flex-1">{product.name}</h3>

        {/* Rating placeholder */}
        <div className="flex items-center gap-1 mt-1.5">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={11} className={i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
          ))}
          <span className="text-[10px] text-gray-400 ml-1">(24)</span>
        </div>

        {/* Price & Cart */}
        <div className="flex items-center justify-between mt-2.5 gap-2">
          <div>
            <p className="text-base font-black text-slate-900">{formatPrice(price)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={adding || isOutOfStock}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-xl transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-200 disabled:opacity-60'
            }`}
          >
            <ShoppingCart size={13} />
            {isOutOfStock ? 'Tükendi' : adding ? '...' : 'Ekle'}
          </button>
        </div>
      </div>
    </Link>
  )
}

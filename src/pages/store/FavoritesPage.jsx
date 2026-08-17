import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { favoriteService } from '@/services/favoriteService'
import ProductCard from '@/components/store/ProductCard'
import toast from 'react-hot-toast'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const data = await favoriteService.getAll()
      setFavorites(data)
    } catch { setFavorites([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleFavoriteToggle(productId, isFav) {
    if (!isFav) {
      await favoriteService.remove(productId)
      setFavorites(prev => prev.filter(f => f.product?.id !== productId && f.product_id !== productId))
      toast.success('Removed from wishlist')
    }
  }

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-2xl" />)}
    </div>
  )

  const products = favorites.map(f => f.product || f).filter(Boolean)

  return (
    <div>
      <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><Heart size={16} className="text-rose-500" /> My Wishlist</h2>
      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Heart size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-slate-600">Your wishlist is empty</p>
          <Link to="/shop" className="mt-3 inline-block text-sm text-indigo-600 hover:underline font-medium">Browse products →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} product={p} isFavorited onFavoriteToggle={handleFavoriteToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

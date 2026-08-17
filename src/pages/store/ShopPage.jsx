import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { productService } from '@/services/productService'
import ProductCard from '@/components/store/ProductCard'

const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'new', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Best Deals' },
]

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '')

  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || ''
  const limit = 18

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productService.getAll({ page, limit, search, status: 'published' })
      setProducts(res.items || [])
      setTotal(res.total || 0)
    } catch { setProducts([]); setTotal(0) } finally { setLoading(false) }
  }, [page, search, sort])

  useEffect(() => { load() }, [load])

  function updateParam(key, value) {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    if (key !== 'page') p.delete('page')
    setSearchParams(p)
  }

  function handleSearch(e) {
    e.preventDefault()
    updateParam('search', localSearch.trim())
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">
          {search ? `Results for "${search}"` : 'All Products'}
        </h1>
        {!loading && <p className="text-sm text-gray-500 mt-1">{total} products found</p>}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1 min-w-48">
          <input
            type="text"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-4 py-2.5 text-sm text-slate-700 placeholder-gray-400 outline-none bg-transparent"
          />
          {localSearch && (
            <button type="button" onClick={() => { setLocalSearch(''); updateParam('search', '') }} className="px-2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
          <button type="submit" className="px-3 py-2.5 text-gray-400 hover:text-indigo-600 transition-colors border-l border-gray-100">
            <Search size={16} />
          </button>
        </form>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => updateParam('sort', e.target.value)}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-slate-700 shadow-sm outline-none cursor-pointer hover:border-indigo-300 transition-colors"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button
          onClick={() => setSidebarOpen(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl bg-white shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all"
        >
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold text-slate-600">No products found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            disabled={page <= 1}
            onClick={() => updateParam('page', page - 1)}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => updateParam('page', p)}
              className={`w-9 h-9 rounded-xl border text-sm font-semibold transition-all ${page === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-400 hover:text-indigo-600'}`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={page >= totalPages}
            onClick={() => updateParam('page', page + 1)}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

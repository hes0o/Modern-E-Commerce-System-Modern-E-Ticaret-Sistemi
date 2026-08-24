import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { productService } from '@/services/productService'
import ProductCard from '@/components/store/ProductCard'
import api from '@/services/api'

const SORT_OPTIONS = [
  { value: '',           label: 'Önerilen' },
  { value: 'new',        label: 'En Yeni' },
  { value: 'price_asc',  label: 'Fiyat: Artan' },
  { value: 'price_desc', label: 'Fiyat: Azalan' },
]

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]   = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Filter state
  const [brands, setBrands]         = useState([])
  const [categories, setCategories] = useState([])
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '')
  const [priceMin, setPriceMin]     = useState(searchParams.get('price_min') || '')
  const [priceMax, setPriceMax]     = useState(searchParams.get('price_max') || '')

  const page     = parseInt(searchParams.get('page') || '1')
  const search   = searchParams.get('search') || ''
  const sort     = searchParams.get('sort') || ''
  const category = searchParams.get('category') || ''
  const brand    = searchParams.get('brand') || ''
  const pMin     = searchParams.get('price_min') || ''
  const pMax     = searchParams.get('price_max') || ''
  const limit    = 18

  // Load brands & categories once
  useEffect(() => {
    api.get('/api/brands').then(r => setBrands(r.data.data || [])).catch(() => {})
    api.get('/api/categories').then(r => setCategories(r.data.data || [])).catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productService.getAll({
        page, limit, search, status: 'published',
        category, brandId: brand, priceMin: pMin, priceMax: pMax, sortBy: sort,
      })
      setProducts(res.items || [])
      setTotal(res.total || 0)
    } catch { setProducts([]); setTotal(0) } finally { setLoading(false) }
  }, [page, search, sort, category, brand, pMin, pMax])

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

  function applyFilters() {
    const p = new URLSearchParams(searchParams)
    if (priceMin) p.set('price_min', priceMin); else p.delete('price_min')
    if (priceMax) p.set('price_max', priceMax); else p.delete('price_max')
    p.delete('page')
    setSearchParams(p)
    setSidebarOpen(false)
  }

  function clearFilters() {
    setPriceMin(''); setPriceMax('')
    const p = new URLSearchParams(searchParams)
    p.delete('price_min'); p.delete('price_max')
    p.delete('brand'); p.delete('category'); p.delete('page')
    setSearchParams(p)
    setSidebarOpen(false)
  }

  const hasActiveFilters = brand || category || pMin || pMax

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">
          {search ? `"${search}" için sonuçlar` : 'Tüm Ürünler'}
        </h1>
        {!loading && <p className="text-sm text-gray-500 mt-1">{total} ürün bulundu</p>}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1 min-w-48">
          <input
            type="text"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="Ürün ara..."
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

        {/* Filter toggle */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border rounded-xl shadow-sm transition-all ${
            hasActiveFilters
              ? 'border-indigo-400 text-indigo-600 bg-indigo-50'
              : 'border-gray-200 bg-white hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          <SlidersHorizontal size={15} />
          Filtreler {hasActiveFilters && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
        </button>
      </div>

      {/* Filter Drawer */}
      {sidebarOpen && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Category */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">Kategori</label>
            <select
              value={category}
              onChange={e => updateParam('category', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Tümü</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">Marka</label>
            <select
              value={brand}
              onChange={e => updateParam('brand', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Tümü</option>
              {brands
                .filter(b => !category || b.category_id === parseInt(category))
                .map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">Fiyat Aralığı (₺)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                placeholder="Min"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                type="number"
                min="0"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                placeholder="Max"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="sm:col-span-3 flex items-center gap-3 pt-1 border-t border-gray-100">
            <button onClick={applyFilters} className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all">
              Uygula
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1.5">
                <X size={14} /> Filtreleri Temizle
              </button>
            )}
          </div>
        </div>
      )}

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
          <p className="text-lg font-semibold text-slate-600">Ürün bulunamadı</p>
          <p className="text-sm mt-1">Filtrelerinizi veya arama teriminizi değiştirmeyi deneyin</p>
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

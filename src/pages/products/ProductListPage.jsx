import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import DataTable from '@/components/common/DataTable'
import Badge from '@/components/common/Badge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { productService } from '@/services/productService'
import { formatCurrency } from '@/utils/formatters'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function ProductListPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const limit = 8

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productService.getAll({ page, limit, search })
      setProducts(res.items)
      setTotalItems(res.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await productService.delete(deleteId)
      setDeleteId(null)
      loadProducts()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      header: 'Ürün',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs overflow-hidden flex-shrink-0">
            {row.image ? <img src={row.image} alt={row.name} className="w-full h-full object-cover" /> : row.sku.slice(0, 3)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 leading-tight">{row.name}</p>
            <p className="text-xs text-slate-400">SKU: {row.sku}</p>
          </div>
        </div>
      ),
    },
    { header: 'Kategori', accessor: 'category' },
    { header: 'Marka', accessor: 'brand' },
    {
      header: 'Fiyat',
      accessor: 'price',
      render: (row) => <span className="font-semibold text-slate-800">{formatCurrency(row.price)}</span>,
    },
    {
      header: 'Stok',
      accessor: 'stock',
      render: (row) => (
        <span className={row.stock === 0 ? 'text-red-600 font-bold' : row.stock <= 10 ? 'text-amber-600 font-semibold' : ''}>
          {row.stock} adet
        </span>
      ),
    },
    {
      header: 'Durum',
      accessor: 'status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'İşlemler',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/products/${row.id}/edit`} className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Edit2 size={16} />
          </Link>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ürün Yönetimi</h1>
          <p className="page-subtitle">Ürün kataloğunu, fiyatları ve varyantları yönetin.</p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          <Plus size={16} />
          Ürün Ekle
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder="Ürün adı veya SKU ile ara..."
        page={page}
        totalPages={Math.ceil(totalItems / limit)}
        totalItems={totalItems}
        itemsPerPage={limit}
        onPageChange={setPage}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Ürün Silinsin mi?"
        message="Bu ürünü silmek istediğinize emin misiniz? Ürüne ait tüm varyantlar da silinecektir."
      />
    </div>
  )
}

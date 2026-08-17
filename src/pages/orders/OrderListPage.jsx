import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import DataTable from '@/components/common/DataTable'
import Badge from '@/components/common/Badge'
import { orderService } from '@/services/orderService'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Eye, Filter, ChevronDown } from 'lucide-react'

const STATUS_LABELS = {
  pending: 'Beklemede',
  processing: 'Hazırlanıyor',
  shipped: 'Kargoda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
}

export default function OrderListPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [statusOpen, setStatusOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const limit = 10

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await orderService.getAll({ page, limit, search, status: statusFilter })
      setOrders(res.items)
      setTotalItems(res.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const columns = [
    { header: 'Sipariş No', accessor: 'id', render: (row) => <span className="font-bold text-slate-800">{row.id}</span> },
    {
      header: 'Müşteri',
      accessor: 'customer',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.customer}</p>
          <p className="text-xs text-slate-400">{row.email}</p>
        </div>
      ),
    },
    { header: 'Tarih', accessor: 'orderedAt', render: (row) => formatDate(row.orderedAt) },
    { header: 'Ürün Sayısı', accessor: 'items', render: (row) => `${row.items.length} kalem` },
    { header: 'Toplam Tutar', accessor: 'total', render: (row) => <span className="font-bold text-slate-800">{formatCurrency(row.total)}</span> },
    { header: 'Durum', accessor: 'status', render: (row) => <Badge status={row.status} /> },
    {
      header: 'İşlem',
      render: (row) => (
        <Link to={`/admin/orders/${row.id}`} className="btn btn-secondary btn-sm flex items-center gap-1">
          <Eye size={14} /> Görüntüle
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">

      <div className="page-header">
        <div>
          <h1 className="page-title">Sipariş Yönetimi</h1>
          <p className="page-subtitle">
            Müşteri siparişlerini takip edin ve güncelleyin.
          </p>
        </div>

        <div className="relative flex items-center gap-2">

          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:shadow-md transition"
          >
            {statusFilter
              ? STATUS_LABELS[statusFilter]
              : 'Tüm Durumlar'
            }

            <ChevronDown
              size={14}
              className={`transition ${statusOpen ? 'rotate-180' : ''
                }`}
            />
          </button>


          {statusOpen && (
            <div className="absolute right-0 top-10 w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20">

              <button
                onClick={() => {
                  setStatusFilter('')
                  setPage(1)
                  setStatusOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                Tüm Durumlar
              </button>


              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setStatusFilter(key)
                    setPage(1)
                    setStatusOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  {label}
                </button>
              ))}

            </div>
          )}

        </div>
      </div>


      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder="Sipariş no veya müşteri adı ara..."
        page={page}
        totalPages={Math.ceil(totalItems / limit)}
        totalItems={totalItems}
        itemsPerPage={limit}
        onPageChange={setPage}
      />

    </div>
  )
}
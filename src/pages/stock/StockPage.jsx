import { useState, useEffect, useCallback } from 'react'

import DataTable from '@/components/common/DataTable'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'

import { stockService } from '@/services/stockService'

import {
  AlertTriangle,
  CheckCircle,
  Edit3,
} from 'lucide-react'


export default function StockPage() {

  const [stockItems, setStockItems] = useState([])

  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')

  const [filter, setFilter] = useState('')

  const [page, setPage] = useState(1)

  const [totalItems, setTotalItems] = useState(0)

  const [editItem, setEditItem] = useState(null)

  const [newQuantity, setNewQuantity] = useState(0)

  const [updating, setUpdating] = useState(false)

  const limit = 10


  // =====================================================
  // STOKLARI GETİR
  // =====================================================

  const loadStock = useCallback(
    async () => {

      setLoading(true)

      try {

        const res =
          await stockService.getAll({
            page,
            limit,
            search,
            filter,
          })

        setStockItems(
          res.items || []
        )

        setTotalItems(
          res.total || 0
        )

      } catch (err) {

        console.error(
          'Stoklar yüklenemedi:',
          err
        )

        setStockItems([])
        setTotalItems(0)

      } finally {

        setLoading(false)
      }

    },
    [
      page,
      search,
      filter,
    ]
  )


  useEffect(() => {
    loadStock()
  }, [loadStock])


  // =====================================================
  // STOK GÜNCELLE
  // =====================================================

  const handleUpdateStock =
    async () => {

      if (!editItem) {
        return
      }

      setUpdating(true)

      try {

        await stockService.updateQuantity(
          editItem.product_id,
          Number(newQuantity),
          editItem.variant_id
        )

        setEditItem(null)

        await loadStock()

      } catch (err) {

        console.error(
          'Stok güncellenemedi:',
          err
        )

      } finally {

        setUpdating(false)
      }
    }


  // =====================================================
  // TABLO
  // =====================================================

  const columns = [

    {
      header: 'Ürün',

      accessor: 'product_name',

      render: (row) => (

        <div>

          <p className="font-semibold text-slate-800">
            {row.product_name}
          </p>

          <p className="text-xs text-slate-400">
            SKU: {row.sku}
          </p>

          {row.variant_id && (

            <p className="text-xs text-blue-500">
              Varyant
            </p>

          )}

        </div>
      ),
    },


    {
      header: 'Kategori',

      accessor: 'category',

      render: (row) => (
        <span>
          {row.category || '-'}
        </span>
      ),
    },


    {
      header: 'Mevcut Stok',

      accessor: 'current_stock',

      render: (row) => (

        <span className="font-bold text-slate-800 text-sm">

          {row.current_stock}

          {' '}adet

        </span>
      ),
    },


    {
      header: 'Stok Durumu',

      render: (row) => {

        const stock =
          Number(row.current_stock || 0)

        const minStock =
          row.min_stock !== null &&
            row.min_stock !== undefined
            ? Number(row.min_stock)
            : null


        if (stock === 0) {

          return (
            <Badge
              status="out_of_stock"
            />
          )
        }


        if (
          minStock !== null &&
          stock <= minStock
        ) {

          return (
            <Badge
              status="low_stock"
            />
          )
        }


        return (
          <Badge
            color="green"
            label="Stokta Var"
          />
        )
      },
    },


    {
      header: 'İşlemler',

      render: (row) => (

        <button
          onClick={() => {

            setEditItem(row)

            setNewQuantity(
              row.current_stock || 0
            )

          }}

          className="btn btn-secondary btn-sm flex items-center gap-1"
        >

          <Edit3 size={14} />

          Stoku Düzenle

        </button>
      ),
    },

  ]


  // =====================================================
  // SAYFA
  // =====================================================

  return (

    <div className="space-y-6">


      {/* HEADER */}

      <div className="page-header">

        <div>

          <h1 className="page-title">
            Stok Yönetimi
          </h1>

          <p className="page-subtitle">
            Depo envanter seviyelerini izleyin ve güncelleyin.
          </p>

        </div>


        {/* FİLTRELER */}

        <div className="flex items-center gap-2">

          <button
            onClick={() => {

              setFilter('')
              setPage(1)

            }}

            className={`btn btn-sm ${filter === ''
              ? 'btn-primary'
              : 'btn-secondary'
              }`}
          >

            Tüm Ürünler

          </button>


          <button
            onClick={() => {

              setFilter('low')
              setPage(1)

            }}

            className={`btn btn-sm ${filter === 'low'
              ? 'btn-primary'
              : 'btn-secondary'
              } flex items-center gap-1`}
          >

            <AlertTriangle
              size={14}
              className="text-amber-500"
            />

            Azalan Stoklar

          </button>


          <button
            onClick={() => {

              setFilter('out')
              setPage(1)

            }}

            className={`btn btn-sm ${filter === 'out'
              ? 'btn-primary'
              : 'btn-secondary'
              } flex items-center gap-1`}
          >

            <CheckCircle
              size={14}
              className="text-red-500"
            />

            Tükenenler

          </button>

        </div>

      </div>


      {/* TABLO */}

      <DataTable

        columns={columns}

        data={stockItems}

        loading={loading}

        searchValue={search}

        onSearchChange={(val) => {

          setSearch(val)
          setPage(1)

        }}

        searchPlaceholder="Ürün adı veya SKU ara..."

        page={page}

        totalPages={
          Math.ceil(
            totalItems / limit
          )
        }

        totalItems={totalItems}

        itemsPerPage={limit}

        onPageChange={setPage}

      />


      {/* STOK DÜZENLEME MODALI */}

      <Modal

        isOpen={Boolean(editItem)}

        onClose={() =>
          setEditItem(null)
        }

        title="Stok Miktarını Düzenle"

        footer={

          <>

            <button
              onClick={() =>
                setEditItem(null)
              }

              className="btn btn-secondary"

              disabled={updating}
            >
              İptal
            </button>


            <button
              onClick={handleUpdateStock}

              className="btn btn-primary"

              disabled={updating}
            >

              {
                updating
                  ? 'Kaydediliyor...'
                  : 'Stoku Güncelle'
              }

            </button>

          </>
        }
      >

        {editItem && (

          <div className="space-y-4">

            <div>

              <p className="text-sm font-semibold text-slate-800">
                {editItem.product_name}
              </p>

              <p className="text-xs text-slate-400">
                SKU: {editItem.sku}
              </p>

            </div>


            <div>

              <label className="label">
                Yeni Stok Miktarı *
              </label>

              <input

                type="number"

                min="0"

                value={newQuantity}

                onChange={(e) =>
                  setNewQuantity(
                    e.target.value
                  )
                }

                className="input"

              />

            </div>

          </div>

        )}

      </Modal>

    </div>
  )
}
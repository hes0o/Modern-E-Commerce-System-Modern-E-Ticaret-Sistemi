import { useState, useEffect } from 'react'
import DataTable from '@/components/common/DataTable'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import api from '@/services/api'
import { slugify } from '@/utils/formatters'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/categories')
      setCategories(res.data.data || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setName('')
    setDescription('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setName(item.name)
    setDescription(item.description || '')
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await api.put(`/api/categories/${editingItem.id}`, {
          name,
          slug: slugify(name),
          description,
        })
      } else {
        await api.post('/api/categories', {
          name,
          slug: slugify(name),
          description,
        })
      }
      setIsModalOpen(false)
      fetchCategories()
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/api/categories/${deleteId}`)
      setDeleteId(null)
      fetchCategories()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const filtered = categories.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.slug || '').toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { header: 'Kategori Adı', accessor: 'name', render: (row) => <span className="font-semibold text-slate-800">{row.name}</span> },
    { header: 'Kısa Kod (Slug)', accessor: 'slug', render: (row) => <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{row.slug}</code> },
    { header: 'Açıklama', accessor: 'description' },
    { header: 'Ürün Sayısı', accessor: 'product_count', render: (row) => `${row.product_count || 0} ürün` },
    {
      header: 'İşlemler',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenEdit(row)} className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg">
            <Edit2 size={16} />
          </button>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
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
          <h1 className="page-title">Kategori Yönetimi</h1>
          <p className="page-subtitle">Mağaza kataloğunuzu kategorilere ayırın ve yönetin.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} />
          Kategori Ekle
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Kategori ara..."
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Kategoriyi Düzenle' : 'Kategori Ekle'}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              İptal
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              Kaydet
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Kategori Adı *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Örn. Elektronik"
            />
          </div>
          <div>
            <label className="label">Açıklama</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              placeholder="Kategori hakkında kısa açıklama..."
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Kategori Silinsin mi?"
        message="Bu kategoriyi silmek istediğinize emin misiniz? Altındaki ürünler kategorisiz olarak güncellenecektir."
      />
    </div>
  )
}

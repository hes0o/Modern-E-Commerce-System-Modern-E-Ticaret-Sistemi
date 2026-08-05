import { useState } from 'react'
import DataTable from '@/components/common/DataTable'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { mockCategories } from '@/mock/categories'
import { slugify } from '@/utils/formatters'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState(mockCategories)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

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

  const handleSave = (e) => {
    e.preventDefault()
    if (editingItem) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingItem.id
            ? { ...c, name, slug: slugify(name), description }
            : c
        )
      )
    } else {
      const newCat = {
        id: Date.now(),
        name,
        slug: slugify(name),
        description,
        productCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setCategories((prev) => [newCat, ...prev])
    }
    setIsModalOpen(false)
  }

  const handleDelete = () => {
    setCategories((prev) => prev.filter((c) => c.id !== deleteId))
    setDeleteId(null)
  }

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { header: 'Kategori Adı', accessor: 'name', render: (row) => <span className="font-semibold text-slate-800">{row.name}</span> },
    { header: 'Kısa Kod (Slug)', accessor: 'slug', render: (row) => <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{row.slug}</code> },
    { header: 'Açıklama', accessor: 'description' },
    { header: 'Ürün Sayısı', accessor: 'productCount', render: (row) => `${row.productCount} ürün` },
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

import { useState } from 'react'
import DataTable from '@/components/common/DataTable'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { mockBrands } from '@/mock/brands'
import { slugify } from '@/utils/formatters'
import { Plus, Edit2, Trash2, Globe } from 'lucide-react'

export default function BrandsPage() {
  const [brands, setBrands] = useState(mockBrands)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')

  const handleOpenCreate = () => {
    setEditingItem(null)
    setName('')
    setWebsite('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setName(item.name)
    setWebsite(item.website || '')
    setIsModalOpen(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (editingItem) {
      setBrands((prev) =>
        prev.map((b) =>
          b.id === editingItem.id
            ? { ...b, name, slug: slugify(name), website }
            : b
        )
      )
    } else {
      const newBrand = {
        id: Date.now(),
        name,
        slug: slugify(name),
        website,
        productCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setBrands((prev) => [newBrand, ...prev])
    }
    setIsModalOpen(false)
  }

  const handleDelete = () => {
    setBrands((prev) => prev.filter((b) => b.id !== deleteId))
    setDeleteId(null)
  }

  const filtered = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { header: 'Marka Adı', accessor: 'name', render: (row) => <span className="font-semibold text-slate-800">{row.name}</span> },
    { header: 'Kısa Kod (Slug)', accessor: 'slug', render: (row) => <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{row.slug}</code> },
    {
      header: 'Web Sitesi',
      accessor: 'website',
      render: (row) => row.website ? (
        <a href={row.website} target="_blank" rel="noreferrer" className="text-brand-600 flex items-center gap-1 hover:underline text-xs">
          <Globe size={14} /> {row.website.replace('https://', '')}
        </a>
      ) : '-',
    },
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
          <h1 className="page-title">Marka Yönetimi</h1>
          <p className="page-subtitle">Üreticileri ve markaları listeleyin, düzenleyin.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} />
          Marka Ekle
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Marka ara..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Markayı Düzenle' : 'Marka Ekle'}
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
            <label className="label">Marka Adı *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Örn. TechPro"
            />
          </div>
          <div>
            <label className="label">Web Sitesi URL</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="input"
              placeholder="https://example.com"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Marka Silinsin mi?"
        message="Bu markayı silmek istediğinize emin misiniz?"
      />
    </div>
  )
}

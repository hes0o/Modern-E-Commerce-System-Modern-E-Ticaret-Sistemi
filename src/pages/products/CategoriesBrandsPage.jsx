import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import api from '@/services/api'
import { slugify } from '@/utils/formatters'
import { Plus, Edit2, Trash2, Tag, Award, ChevronDown, ChevronRight, Globe } from 'lucide-react'

export default function CategoriesBrandsPage() {
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedCats, setExpandedCats] = useState({})

  // Modals
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [brandModalOpen, setBrandModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [editingBrand, setEditingBrand] = useState(null)
  
  // Forms
  const [catName, setCatName] = useState('')
  const [catDesc, setCatDesc] = useState('')
  
  const [brandName, setBrandName] = useState('')
  const [brandWeb, setBrandWeb] = useState('')
  const [brandCatId, setBrandCatId] = useState('')

  // Delete
  const [deleteCatId, setDeleteCatId] = useState(null)
  const [deleteBrandId, setDeleteBrandId] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [catRes, brandRes] = await Promise.all([
        api.get('/api/categories'),
        api.get('/api/brands/admin')
      ])
      setCategories(catRes.data.data || [])
      setBrands(brandRes.data.data || [])
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const toggleCat = (id) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // CATEGORY HANDLERS
  const openCatModal = (cat = null) => {
    setEditingCat(cat)
    setCatName(cat ? cat.name : '')
    setCatDesc(cat ? (cat.description || '') : '')
    setCatModalOpen(true)
  }

  const saveCategory = async (e) => {
    e.preventDefault()
    try {
      const payload = { name: catName, slug: slugify(catName) }
      if (editingCat) {
        await api.put(`/api/categories/${editingCat.id}`, payload)
      } else {
        await api.post('/api/categories', payload)
      }
      setCatModalOpen(false)
      fetchData()
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  const deleteCategory = async () => {
    try {
      await api.delete(`/api/categories/${deleteCatId}`)
      setDeleteCatId(null)
      fetchData()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  // BRAND HANDLERS
  const openBrandModal = (brand = null) => {
    setEditingBrand(brand)
    setBrandName(brand ? brand.name : '')
    setBrandWeb(brand ? (brand.website || '') : '')
    setBrandCatId(brand ? brand.category_id : '')
    setBrandModalOpen(true)
  }

  const saveBrand = async (e) => {
    e.preventDefault()
    try {
      const payload = { 
        name: brandName, 
        category_id: parseInt(brandCatId) 
      }
      // Assuming we patch website via another route or it's not supported currently by backend update schema.
      // We will only send name and category_id as per our schema update.
      if (editingBrand) {
        await api.patch(`/api/brands/${editingBrand.id}`, payload)
      } else {
        await api.post('/api/brands', payload)
      }
      setBrandModalOpen(false)
      fetchData()
    } catch (err) {
      console.error('Save failed:', err)
      alert(err.response?.data?.message || 'Bir hata oluştu')
    }
  }

  const deleteBrand = async () => {
    try {
      await api.delete(`/api/brands/${deleteBrandId}`)
      setDeleteBrandId(null)
      fetchData()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kategori & Marka Yönetimi</h1>
          <p className="page-subtitle">Kategorilerinizi ve onlara bağlı markaları yönetin.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openBrandModal()} className="btn btn-secondary flex items-center gap-1">
            <Award size={16} /> Marka Ekle
          </button>
          <button onClick={() => openCatModal()} className="btn btn-primary flex items-center gap-1">
            <Tag size={16} /> Kategori Ekle
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Yükleniyor...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Henüz kategori bulunmuyor.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories.map(cat => {
              const catBrands = brands.filter(b => b.category_id === cat.id)
              const isExpanded = expandedCats[cat.id]

              return (
                <div key={cat.id} className="flex flex-col">
                  {/* Category Row */}
                  <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleCat(cat.id)}>
                      <button className="text-slate-400 hover:text-slate-600">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </button>
                      <div>
                        <h3 className="font-semibold text-slate-800">{cat.name}</h3>
                        <p className="text-xs text-slate-500">{catBrands.length} Marka</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openCatModal(cat)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDeleteCatId(cat.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Brands List */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-slate-100 px-12 py-3">
                      {catBrands.length > 0 ? (
                        <div className="space-y-2">
                          {catBrands.map(brand => (
                            <div key={brand.id} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                              <div className="flex items-center gap-3">
                                <Award size={16} className="text-indigo-500" />
                                <span className="font-medium text-slate-700">{brand.name}</span>
                                {!brand.is_active && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Pasif</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => openBrandModal(brand)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => setDeleteBrandId(brand.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 py-2">Bu kategoriye ait marka bulunamadı.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCat ? 'Kategoriyi Düzenle' : 'Kategori Ekle'}
        footer={
          <>
            <button onClick={() => setCatModalOpen(false)} className="btn btn-secondary">İptal</button>
            <button onClick={saveCategory} className="btn btn-primary">Kaydet</button>
          </>
        }
      >
        <form onSubmit={saveCategory} className="space-y-4">
          <div>
            <label className="label">Kategori Adı *</label>
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="input"
              placeholder="Örn. Elektronik"
            />
          </div>
        </form>
      </Modal>

      {/* Brand Modal */}
      <Modal
        isOpen={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        title={editingBrand ? 'Markayı Düzenle' : 'Marka Ekle'}
        footer={
          <>
            <button onClick={() => setBrandModalOpen(false)} className="btn btn-secondary">İptal</button>
            <button onClick={saveBrand} className="btn btn-primary" disabled={!brandCatId || !brandName}>Kaydet</button>
          </>
        }
      >
        <form onSubmit={saveBrand} className="space-y-4">
          <div>
            <label className="label">Kategori *</label>
            <select
              required
              value={brandCatId}
              onChange={(e) => setBrandCatId(e.target.value)}
              className="select"
            >
              <option value="">Kategori Seçin</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Marka Adı *</label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="input"
              placeholder="Örn. TechPro"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Dialogs */}
      <ConfirmDialog
        isOpen={Boolean(deleteCatId)}
        onClose={() => setDeleteCatId(null)}
        onConfirm={deleteCategory}
        title="Kategori Silinsin mi?"
        message="Bu kategoriyi silmek istediğinize emin misiniz? Altındaki markalar kategorisiz kalabilir."
      />

      <ConfirmDialog
        isOpen={Boolean(deleteBrandId)}
        onClose={() => setDeleteBrandId(null)}
        onConfirm={deleteBrand}
        title="Marka Silinsin mi?"
        message="Bu markayı silmek istediğinize emin misiniz?"
      />
    </div>
  )
}

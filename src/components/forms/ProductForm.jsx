import { useState, useEffect } from 'react'
import ImageUploader from '@/components/common/ImageUploader'
import VariantBuilder from './VariantBuilder'
import api from '@/services/api'

export default function ProductForm({
  initialValues,
  onSubmit,
  loading = false,
  isEdit = false
}) {

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  useEffect(() => {
    api.get('/api/categories')
      .then(res => setCategories(res.data.data || []))
      .catch(() => { })
    api.get('/api/brands')
      .then(res => setBrands(res.data.data || []))
      .catch(() => { })
  }, [])

  const [formData, setFormData] = useState({
    name: initialValues?.name || '',
    sku: initialValues?.sku || '',
    category_id: initialValues?.category_id || '',
    brand_id: initialValues?.brand_id || '',
    price: initialValues?.price ?? '',
    discount_price: initialValues?.discount_price ?? '',
    vat_rate: initialValues?.vat_rate ?? 20,
    stock: initialValues?.stock ?? 0,
    status: initialValues?.status || 'active',
    short_description: initialValues?.short_description || '',
    long_description: initialValues?.long_description || '',
    image: initialValues?.image || null,
    has_variants: initialValues?.has_variants || false,
    variants: initialValues?.variants || [],
  })

  // Set default category_id / brand_id once loaded if empty
  useEffect(() => {
    if (!formData.category_id && categories.length > 0) {
      setFormData(prev => ({ ...prev, category_id: categories[0].id }))
    }
  }, [categories, formData.category_id])



  // Update form data if initialValues change (e.g. edit mode load)
  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        sku: initialValues.sku || '',
        category_id: initialValues.category_id || '',
        brand_id: initialValues.brand_id || '',
        price: initialValues.price ?? '',
        discount_price: initialValues.discount_price ?? '',
        vat_rate: initialValues.vat_rate ?? 20,
        stock: initialValues.stock ?? 0,
        status: initialValues.status || 'active',
        short_description: initialValues.short_description || '',
        long_description: initialValues.long_description || '',
        image: initialValues.image || null,
        has_variants: initialValues.has_variants || false,
        variants: initialValues.variants || [],
      })
    }
  }, [initialValues])

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'category_id') {
        next.brand_id = '' // Reset brand when category changes
      }
      return next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const hasVars = (formData.variants || []).length > 0

    const payload = {
      name: formData.name,
      sku: formData.sku,
      category_id: Number(formData.category_id),
      brand_id: formData.brand_id ? Number(formData.brand_id) : null,
      price: Number(formData.price),
      discount_price: formData.discount_price !== '' && formData.discount_price !== null ? Number(formData.discount_price) : null,
      vat_rate: Number(formData.vat_rate) || 20,
      status: formData.status,
      has_variants: hasVars,
      stock: hasVars ? null : Number(formData.stock),
      short_description: formData.short_description || formData.name,
      long_description: formData.long_description || formData.short_description || formData.name,
      variants: hasVars ? formData.variants : [],
    }

    onSubmit(payload)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOL TARAF */}
        <div className="lg:col-span-2 space-y-6">
          {/* Genel Bilgiler */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Genel Bilgiler
            </h3>

            <div>
              <label className="label">
                Ürün Adı *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  handleChange(
                    'name',
                    e.target.value
                  )
                }
                placeholder="Örn. Kablosuz Kulaklık Pro"
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Stok Kodu (SKU) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) =>
                    handleChange(
                      'sku',
                      e.target.value
                    )
                  }
                  placeholder="Örn. KBL-001"
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  Durum
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    handleChange(
                      'status',
                      e.target.value
                    )
                  }
                  className="select"
                >
                <option value="active">
                    Aktif
                  </option>
                  <option value="inactive">
                    Pasif
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">
                Kısa Açıklama *
              </label>
              <input
                type="text"
                required
                value={formData.short_description}
                onChange={(e) =>
                  handleChange(
                    'short_description',
                    e.target.value
                  )
                }
                placeholder="Ürün özet açıklaması..."
                className="input"
              />
            </div>

            <div>
              <label className="label">
                Detaylı Açıklama *
              </label>
              <textarea
                rows={4}
                required
                value={formData.long_description}
                onChange={(e) =>
                  handleChange(
                    'long_description',
                    e.target.value
                  )
                }
                placeholder="Ürün detayları ve tüm açıklaması..."
                className="input"
              />
            </div>
          </div>

          {/* Fiyat Stok */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Fiyatlandırma & Stok
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">
                  Fiyat (₺) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    handleChange(
                      'price',
                      e.target.value
                    )
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  İndirimli Fiyat (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount_price}
                  onChange={(e) =>
                    handleChange(
                      'discount_price',
                      e.target.value
                    )
                  }
                  placeholder="İsteğe bağlı"
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  Stok Miktarı {(formData.variants || []).length > 0 ? '(Varyantlı üründe devre dışı)' : '*'}
                </label>
                <input
                  type="number"
                  disabled={(formData.variants || []).length > 0}
                  required={!(formData.variants || []).length}
                  value={formData.stock}
                  onChange={(e) =>
                    handleChange(
                      'stock',
                      e.target.value
                    )
                  }
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Varyant */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Ürün Varyantları
            </h3>

            <VariantBuilder
              variants={formData.variants}
              onChange={(variants) =>
                handleChange(
                  'variants',
                  variants
                )
              }
              baseSku={formData.sku}
              basePrice={formData.price}
            />
          </div>
        </div>

        {/* SAĞ TARAF */}
        <div className="space-y-6">
          {/* Kategori & Marka */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Kategori & Marka
            </h3>

            <div>
              <label className="label">
                Kategori *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) =>
                  handleChange(
                    'category_id',
                    e.target.value
                  )
                }
                className="select"
              >
                <option value="">Kategori Seçin</option>
                {categories.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                Marka
              </label>
              <select
                value={formData.brand_id}
                onChange={(e) =>
                  handleChange(
                    'brand_id',
                    e.target.value
                  )
                }
                className="select"
                disabled={!formData.category_id}
              >
                <option value="">
                  {!formData.category_id ? 'Önce Kategori Seçin' : 'Marka Seçin (İsteğe Bağlı)'}
                </option>
                {brands.filter(b => b.category_id === Number(formData.category_id)).map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                  >
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Görsel */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Ürün Görseli
            </h3>

            <ImageUploader
              value={formData.image}
              onChange={(url) =>
                handleChange(
                  'image',
                  url
                )
              }
            />
          </div>


        </div>






        {/* Kaydet */}



        <div className="pt-4">


          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3"
          >

            {
              loading
                ? 'Kaydediliyor...'
                : isEdit
                  ? 'Ürünü Güncelle'
                  : 'Ürün Oluştur'
            }


          </button>


        </div>



      </div>






    </form >
  )
}
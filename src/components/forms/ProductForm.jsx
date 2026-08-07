import { useState } from 'react'
import ImageUploader from '@/components/common/ImageUploader'
import VariantBuilder from './VariantBuilder'
import { mockCategories } from '@/mock/categories'
import { mockBrands } from '@/mock/brands'

export default function ProductForm({
  initialValues,
  onSubmit,
  loading = false,
  isEdit = false
}) {

  const [formData, setFormData] = useState({
    name: initialValues?.name || '',
    sku: initialValues?.sku || '',

    category:
      initialValues?.category ||
      mockCategories[0]?.name ||
      '',

    brand:
      initialValues?.brand ||
      mockBrands[0]?.name ||
      '',

    supplier:
      initialValues?.supplier ||
      '',

    price:
      initialValues?.price ||
      0,

    stock:
      initialValues?.stock ||
      0,

    status:
      initialValues?.status ||
      'active',

    description:
      initialValues?.description ||
      '',

    image:
      initialValues?.image ||
      null,

    variants:
      initialValues?.variants ||
      [],
  })


  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }


  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
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

                  <option value="draft">
                    Taslak
                  </option>

                  <option value="out_of_stock">
                    Stokta Yok
                  </option>

                </select>


              </div>


            </div>



            <div>

              <label className="label">
                Açıklama
              </label>


              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  handleChange(
                    'description',
                    e.target.value
                  )
                }
                placeholder="Ürün detayları ve açıklaması..."
                className="input"
              />


            </div>


          </div>




          {/* Fiyat Stok */}


          <div className="card p-6 space-y-4">


            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Fiyatlandırma & Stok
            </h3>



            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


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
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="input"
                />


              </div>




              <div>

                <label className="label">
                  Stok Miktarı *
                </label>


                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) =>
                    handleChange(
                      'stock',
                      parseInt(e.target.value) || 0
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


          {/* Kategori Marka Tedarikçi */}


          <div className="card p-6 space-y-4">


            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Kategori, Marka & Tedarikçi
            </h3>



            <div>

              <label className="label">
                Kategori
              </label>


              <select
                value={formData.category}
                onChange={(e) =>
                  handleChange(
                    'category',
                    e.target.value
                  )
                }
                className="select"
              >

                {mockCategories.map((c) => (

                  <option
                    key={c.id}
                    value={c.name}
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
                value={formData.brand}
                onChange={(e) =>
                  handleChange(
                    'brand',
                    e.target.value
                  )
                }
                className="select"
              >


                {mockBrands.map((b) => (

                  <option
                    key={b.id}
                    value={b.name}
                  >
                    {b.name}
                  </option>


                ))}


              </select>


            </div>




            <div>


              <label className="label">
                Tedarikçi
              </label>


              <input
                type="text"
                value={formData.supplier}
                onChange={(e) =>
                  handleChange(
                    'supplier',
                    e.target.value
                  )
                }
                placeholder="Örn. ABC Tekstil"
                className="input"
              />


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



      </div>


    </form>
  )
}
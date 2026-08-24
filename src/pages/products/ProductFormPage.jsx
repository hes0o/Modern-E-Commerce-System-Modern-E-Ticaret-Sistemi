import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ProductForm from '@/components/forms/ProductForm'
import { productService } from '@/services/productService'
import { ArrowLeft } from 'lucide-react'

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [initialValues, setInitialValues] = useState(null)
  const [loadingPage, setLoadingPage] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isEdit) {
      async function loadProduct() {
        try {
          const res = await productService.getById(id)
          setInitialValues(res)
        } catch (err) {
          console.error(err)
        } finally {
          setLoadingPage(false)
        }
      }
      loadProduct()
    }
  }, [id, isEdit])

  const handleSubmit = async (formData) => {
    setSubmitting(true)
    try {
      if (isEdit) {
        await productService.update(id, formData)
      } else {
        await productService.create(formData)
      }
      navigate('/admin/products')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/products" className="btn btn-secondary btn-sm p-2">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-title">{isEdit ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h1>
          <p className="page-subtitle">
            {isEdit ? 'Ürün detaylarını, fiyatlandırmayı ve varyant matrisini güncelleyin.' : 'Ürün bilgilerini, görsellerini ve varyantlarını girin.'}
          </p>
        </div>
      </div>

      <ProductForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        loading={submitting}
        isEdit={isEdit}
        productId={isEdit ? id : null}
      />
    </div>
  )
}

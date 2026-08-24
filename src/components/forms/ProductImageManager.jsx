import { useState, useEffect, useRef } from 'react'
import api from '@/services/api'
import { Plus, Trash2, Star, Upload, Loader } from 'lucide-react'

/**
 * ProductImageManager — multi-image manager for edit mode.
 * Calls GET/POST/DELETE /api/products/{productId}/images
 */
export default function ProductImageManager({ productId }) {
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    if (!productId) return
    api.get(`/api/products/${productId}/images`)
      .then(r => setImages(r.data.data || []))
      .catch(() => {})
  }, [productId])

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('is_cover', images.length === 0 ? 'true' : 'false')
      form.append('sort_order', images.length)
      const res = await api.post(`/api/products/${productId}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setImages(prev => [...prev, res.data.data])
    } catch { /* handled by interceptor */ } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDelete(imgId) {
    setDeletingId(imgId)
    try {
      await api.delete(`/api/products/${productId}/images/${imgId}`)
      setImages(prev => prev.filter(img => img.id !== imgId))
    } catch { /* handled */ } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Existing images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map(img => (
            <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img src={img.url} alt="product" className="w-full h-full object-cover" />
              {img.is_cover && (
                <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star size={9} /> Kapak
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                disabled={deletingId === img.id}
                className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 disabled:opacity-60"
              >
                {deletingId === img.id ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-4 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all disabled:opacity-60 bg-slate-50 hover:bg-indigo-50"
      >
        {uploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
        {uploading ? 'Yükleniyor…' : 'Görsel Ekle'}
      </button>

      {images.length === 0 && !uploading && (
        <p className="text-xs text-slate-400 text-center">İlk yüklenen görsel otomatik kapak görseli olur.</p>
      )}
    </div>
  )
}

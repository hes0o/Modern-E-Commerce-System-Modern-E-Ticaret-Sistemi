import { useState, useRef } from 'react'
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react'

export default function ImageUploader({ value, onChange, label = 'Ürün Görseli' }) {
  const [preview, setPreview] = useState(value || null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      onChange(url)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      {preview ? (
        <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-slate-200 group">
          <img src={preview} alt="Yükleme önizleme" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl hover:border-brand-500 hover:bg-brand-50/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <div className="p-3 bg-slate-100 rounded-full text-slate-500">
            <UploadCloud size={24} />
          </div>
          <div className="text-center">
            <span className="text-sm font-semibold text-brand-600">Görsel yüklemek için tıklayın</span>
            <span className="text-sm text-slate-500"> veya sürükleyip bırakın</span>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP (maksimum 5MB)</p>
          </div>
        </div>
      )}
    </div>
  )
}

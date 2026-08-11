import { useState } from 'react'
import { Plus, Trash2, Layers } from 'lucide-react'
import { COLORS, SIZES_CLOTHING } from '@/utils/constants'

export default function VariantBuilder({ variants = [], onChange, baseSku = '', basePrice = 0 }) {
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])

  const toggleColor = (c) => {
    const next = selectedColors.includes(c) ? selectedColors.filter((i) => i !== c) : [...selectedColors, c]
    setSelectedColors(next)
  }

  const toggleSize = (s) => {
    const next = selectedSizes.includes(s) ? selectedSizes.filter((i) => i !== s) : [...selectedSizes, s]
    setSelectedSizes(next)
  }

  const generateMatrix = () => {
    if (selectedColors.length === 0 || selectedSizes.length === 0) return

    const newVariants = []
    selectedColors.forEach((color) => {
      selectedSizes.forEach((size) => {
        const skuTag = `${color.slice(0, 2).toUpperCase()}-${size}`
        const exists = variants.find((v) => v.color === color && v.size === size)
        if (!exists) {
          newVariants.push({
            color,
            size,
            sku: baseSku ? `${baseSku}-${skuTag}` : skuTag,
            price: Number(basePrice) || 0,
            stock: 10,
          })
        }
      })
    })

    onChange([...variants, ...newVariants])
  }

  const handleUpdateVariant = (index, field, value) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const handleRemoveVariant = (index) => {
    onChange(variants.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="card p-4 bg-slate-50 border border-slate-200 space-y-4">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Layers size={16} className="text-brand-500" />
          Varyant Oluşturucu (Renk × Beden Matrisi)
        </h4>

        <div>
          <label className="label text-xs">Renk Seçin</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleColor(c)}
                className={`btn btn-sm ${
                  selectedColors.includes(c) ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label text-xs">Beden Seçin</label>
          <div className="flex flex-wrap gap-2">
            {SIZES_CLOTHING.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`btn btn-sm ${
                  selectedSizes.includes(s) ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={generateMatrix}
          disabled={selectedColors.length === 0 || selectedSizes.length === 0}
          className="btn btn-secondary btn-sm flex items-center gap-2"
        >
          <Plus size={14} />
          Kombinasyon Oluştur ({selectedColors.length * selectedSizes.length} varyant)
        </button>
      </div>

      {variants.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Renk</th>
                <th>Beden</th>
                <th>STOK KODU (SKU)</th>
                <th>Fiyat (₺)</th>
                <th>Stok Adedi</th>
                <th className="w-12">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v, idx) => (
                <tr key={idx}>
                  <td className="font-semibold text-slate-800">{v.color}</td>
                  <td>{v.size}</td>
                  <td>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                      className="input py-1 text-xs"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => handleUpdateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                      className="input py-1 text-xs w-24"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => handleUpdateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                      className="input py-1 text-xs w-20"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

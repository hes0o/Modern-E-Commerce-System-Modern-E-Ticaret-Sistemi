import { useState } from 'react'
import { Store, Bell, Globe, Save } from 'lucide-react'

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('E-Ticaret Yönetim Paneli')
  const [currency, setCurrency] = useState('TRY')
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mağaza Ayarları</h1>
          <p className="page-subtitle">Mağaza kimliğini, para birimini ve bildirim tercihlerini yönetin.</p>
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100 animate-fade-in">
          Ayarlar başarıyla güncellendi!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Store size={18} className="text-brand-500" /> Genel Mağaza Bilgileri
          </h3>

          <div>
            <label className="label">Mağaza Adı</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Varsayılan Para Birimi</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="select"
            >
              <option value="TRY">Türk Lirası (₺)</option>
              <option value="USD">Amerikan Doları ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">İngiliz Sterlini (£)</option>
            </select>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Bell size={18} className="text-brand-500" /> Bildirimler & Uyarılar
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Düşük Stok E-posta Bildirimleri</p>
              <p className="text-xs text-slate-400">Ürün stoğu kritik seviyeye düştüğünde e-posta uyarısı alırsınız.</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-5 h-5 rounded text-brand-500 focus:ring-brand-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary flex items-center gap-2">
            <Save size={16} /> Ayarları Kaydet
          </button>
        </div>
      </form>
    </div>
  )
}

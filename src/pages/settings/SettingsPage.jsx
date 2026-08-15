import { useState, useEffect } from 'react'
import { Store, Bell, Save } from 'lucide-react'
import api from '@/services/api'

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('E-Ticaret Yönetim Paneli')
  const [currency, setCurrency] = useState('TRY')
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Ayarları database'den yükle
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.get('/api/admin/settings')
        const items = res.data.data || []
        items.forEach((s) => {
          if (s.key === 'store_name') setStoreName(s.value)
          if (s.key === 'currency') setCurrency(s.value)
          if (s.key === 'email_alerts') setEmailAlerts(s.value === 'true')
        })
      } catch (err) {
        console.error('Ayarlar yüklenemedi:', err)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.put('/api/admin/settings/upsert', [
        { key: 'store_name', value: storeName, setting_group: 'general' },
        { key: 'currency', value: currency, setting_group: 'general' },
        { key: 'email_alerts', value: String(emailAlerts), setting_group: 'notifications' },
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Ayarlar kaydedilemedi:', err)
      setError('Ayarlar kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
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
          ✓ Ayarlar başarıyla kaydedildi!
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Genel Bilgiler */}
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
              placeholder="Mağaza adını girin"
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
            <p className="text-xs text-slate-400 mt-1">Şu an seçili: <strong>{currency}</strong></p>
          </div>
        </div>

        {/* Bildirimler */}
        <div className="card p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Bell size={18} className="text-brand-500" /> Bildirimler & Uyarılar
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Düşük Stok E-posta Bildirimleri</p>
              <p className="text-xs text-slate-400">Ürün stoğu kritik seviyeye düştüğünde e-posta uyarısı alırsınız.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="btn btn-primary flex items-center gap-2">
            <Save size={16} /> {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}

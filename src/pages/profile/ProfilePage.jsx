import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import ImageUploader from '@/components/common/ImageUploader'
import { getInitials } from '@/utils/formatters'
import { User, Lock, Mail, Shield, Save } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [avatar, setAvatar] = useState(user?.avatar || null)
  const [password, setPassword] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    updateProfile({ name, email, avatar })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const getRoleLabel = (role) => {
    const map = { Admin: 'Yönetici', Employee: 'Personel', Customer: 'Müşteri', Guest: 'Misafir' }
    return map[role] || role
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kullanıcı Profili</h1>
          <p className="page-subtitle">Kişisel bilgilerinizi ve profil fotoğrafınızı güncelleyin.</p>
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100 animate-fade-in">
          Profil başarıyla güncellendi!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full gradient-brand flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {avatar ? <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" /> : getInitials(name)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{name}</h2>
            <p className="text-xs text-slate-400">{email}</p>
          </div>
          <span className="px-3 py-1 bg-brand-50 text-brand-600 font-semibold text-xs rounded-full">
            {getRoleLabel(user?.role)} Hesabı
          </span>
        </div>

        <div className="lg:col-span-2 card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Hesap Detayları
            </h3>

            <div>
              <label className="label">Ad Soyad</label>
              <div className="relative flex items-center">
                <User size={16} className="absolute left-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="label">E-posta Adresi</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="label">Yeni Şifre (değiştirmek istemiyorsanız boş bırakın)</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <ImageUploader label="Profil Fotoğrafı" value={avatar} onChange={setAvatar} />
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="btn btn-primary flex items-center gap-2">
                <Save size={16} /> Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

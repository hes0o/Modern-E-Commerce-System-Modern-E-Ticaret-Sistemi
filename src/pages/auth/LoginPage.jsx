import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ShoppingCart, Lock, Mail, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (error) {
      setErr(error.message || 'Geçersiz e-posta veya şifre')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-lg">
            <ShoppingCart size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">E-Ticaret Yönetim Paneli</h1>
          <p className="text-sm text-slate-500">Mağazanızı yönetmek için giriş yapın</p>
        </div>

        {err && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
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
                placeholder="E-posta adresinizi girin"
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className="label">Şifre</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-9"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ShoppingCart, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'

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
      setErr(error.response?.data?.detail || error.message || 'Geçersiz e-posta veya şifre')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 space-y-8 relative z-10 border border-slate-100">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
            <ShoppingCart size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Yönetim Paneli</h1>
            <p className="text-xs text-slate-500 mt-1">E-Ticaret sistemine güvenli giriş yapın</p>
          </div>
        </div>

        {err && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-100/80 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label text-slate-700 font-semibold mb-1.5 block text-xs">E-posta Adresi</label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                placeholder="eposta@maza.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label text-slate-700 font-semibold text-xs mb-0">Şifre</label>
            </div>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full h-11 text-sm font-semibold flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all mt-2"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>SSL 256-Bit Şifreli Güvenli Yönetim Portalı</span>
        </div>
      </div>
    </div>
  )
}

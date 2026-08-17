import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ShoppingBag, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'

export default function CustomerLoginPage() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') === 'register' ? 'register' : 'login')
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Register state
  const [reg, setReg] = useState({ name: '', email: '', phone: '', password: '', password_confirm: '' })
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState('')

  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer') navigate('/')
    else if (isAuthenticated && (user?.role === 'admin' || user?.role === 'personnel')) navigate('/admin/dashboard')
  }, [isAuthenticated, user, navigate])

  async function handleLogin(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const u = await login(email, password)
      if (u.role === 'admin' || u.role === 'personnel') navigate('/admin/dashboard')
      else navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setRegError(''); setRegLoading(true)
    try {
      await api.post('/api/auth/register', { ...reg, kvkk_accepted: true, newsletter_allowed: false })
      toast.success('Account created! Please sign in.')
      setTab('login')
      setEmail(reg.email)
    } catch (err) {
      const detail = err.response?.data
      setRegError(detail?.message || detail?.errors?.[0]?.message || 'Registration failed')
    } finally { setRegLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <ShoppingBag size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900">Shop<span className="text-indigo-600">Now</span></span>
          </Link>
          <p className="text-gray-500 text-sm">{tab === 'login' ? 'Sign in to your account' : 'Create your free account'}</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); setRegError('') }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all capitalize ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all bg-gray-50 focus:bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm text-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all bg-gray-50 focus:bg-white" />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5 disabled:opacity-60 mt-2">
                {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {regError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-0.5 flex-shrink-0" />
                  {regError}
                </div>
              )}
              {[
                { field: 'name', icon: User, label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                { field: 'email', icon: Mail, label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
                { field: 'phone', icon: Phone, label: 'Phone Number', type: 'tel', placeholder: '+90 555 123 45 67' },
                { field: 'password', icon: Lock, label: 'Password', type: 'password', placeholder: '••••••••' },
                { field: 'password_confirm', icon: Lock, label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
              ].map(({ field, icon: Icon, label, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={type} required={field !== 'phone'} value={reg[field]}
                      onChange={e => setReg(r => ({ ...r, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all bg-gray-50 focus:bg-white" />
                  </div>
                </div>
              ))}
              <button type="submit" disabled={regLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5 disabled:opacity-60 mt-2">
                {regLoading ? 'Creating account...' : 'Create Account'} <ArrowRight size={16} />
              </button>
            </form>
          )}

          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck size={13} className="text-emerald-500" />
            SSL encrypted. Your data is safe with us.
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Store staff? <Link to="/admin" className="text-indigo-600 hover:underline font-medium">Admin login →</Link>
        </p>
      </div>
    </div>
  )
}

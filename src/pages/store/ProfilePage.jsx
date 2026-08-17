import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Phone, Save } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' })
  const [loading, setLoading] = useState(false)
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)

  async function handleProfileSave(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.patch('/api/auth/me', form)
      updateProfile(res.data.data)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setLoading(false) }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPwLoading(true)
    try {
      await api.patch('/api/auth/me/password', pwForm)
      toast.success('Password changed successfully!')
      setPwForm({ current_password: '', new_password: '', new_password_confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed')
    } finally { setPwLoading(false) }
  }

  return (
    <div className="space-y-5">
      {/* Profile Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2"><User size={16} className="text-indigo-500" /> Personal Information</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          {[
            { field: 'name', label: 'Full Name', icon: User, type: 'text' },
            { field: 'email', label: 'Email Address', icon: Mail, type: 'email' },
            { field: 'phone', label: 'Phone Number', icon: Phone, type: 'tel' },
          ].map(({ field, label, icon: Icon, type }) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
              <div className="relative">
                <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all" />
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-60">
            <Save size={15} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 mb-5">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { field: 'current_password', label: 'Current Password' },
            { field: 'new_password', label: 'New Password' },
            { field: 'new_password_confirm', label: 'Confirm New Password' },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
              <input type="password" value={pwForm[field]} onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all" />
            </div>
          ))}
          <button type="submit" disabled={pwLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-60">
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react'
import { addressService } from '@/services/addressService'
import toast from 'react-hot-toast'

const EMPTY_FORM = { title: '', recipient_name: '', phone: '', city: '', district: '', full_address: '', postal_code: '', is_default: false }

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null = closed, 'new' = new, id = edit
  const [form, setForm] = useState(EMPTY_FORM)

  async function load() {
    try { const data = await addressService.getAll(); setAddresses(data) }
    catch { setAddresses([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(EMPTY_FORM); setEditing('new') }
  function openEdit(addr) { setForm({ ...addr }); setEditing(addr.id) }

  async function handleSave() {
    try {
      if (editing === 'new') {
        await addressService.create(form)
        toast.success('Address added!')
      } else {
        await addressService.update(editing, form)
        toast.success('Address updated!')
      }
      setEditing(null)
      load()
    } catch { toast.error('Could not save address') }
  }

  async function handleDelete(id) {
    try { await addressService.remove(id); load(); toast.success('Address removed') }
    catch { toast.error('Could not remove address') }
  }

  const FIELDS = [
    { f: 'title', label: 'Title', placeholder: 'Home, Work...' },
    { f: 'recipient_name', label: 'Recipient Name', placeholder: 'Full name' },
    { f: 'phone', label: 'Phone', placeholder: '+90 555 123 45 67' },
    { f: 'city', label: 'City', placeholder: 'Istanbul' },
    { f: 'district', label: 'District', placeholder: 'Kadıköy' },
    { f: 'postal_code', label: 'Postal Code', placeholder: '34000' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2"><MapPin size={16} className="text-indigo-500" /> Addresses</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline">
          <Plus size={15} /> Add New
        </button>
      </div>

      {/* Address cards */}
      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />)}</div>
      ) : addresses.length === 0 && editing === null ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <MapPin size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-slate-600">No addresses saved yet</p>
          <button onClick={openNew} className="mt-3 text-sm text-indigo-600 hover:underline font-medium">Add your first address →</button>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {addresses.map(addr => (
            <div key={addr.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start justify-between gap-3 hover:border-indigo-100 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={16} className="text-indigo-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{addr.title}</p>
                    {addr.is_default && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Default</span>}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{addr.recipient_name} · {addr.phone}</p>
                  <p className="text-xs text-gray-400">{addr.full_address}, {addr.district}, {addr.city}</p>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(addr)} className="p-2 rounded-xl hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-all"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(addr.id)} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {editing !== null && (
        <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-5 mt-2">
          <h3 className="text-sm font-bold text-slate-900 mb-4">{editing === 'new' ? 'Add New Address' : 'Edit Address'}</h3>
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map(({ f, label, placeholder }) => (
              <div key={f}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
                <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 bg-white" />
              </div>
            ))}
          </div>
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Address</label>
            <textarea value={form.full_address} onChange={e => setForm(p => ({ ...p, full_address: e.target.value }))} rows={2} placeholder="Street, building, apt..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 bg-white resize-none" />
          </div>
          <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.is_default} onChange={e => setForm(p => ({ ...p, is_default: e.target.checked }))} className="accent-indigo-600" />
            <span className="text-xs font-medium text-slate-700">Set as default address</span>
          </label>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all">Save Address</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

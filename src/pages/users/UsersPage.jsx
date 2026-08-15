import { useState, useEffect, useCallback } from 'react'
import DataTable from '@/components/common/DataTable'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { userService } from '@/services/userService'
import { getInitials, formatDate } from '@/utils/formatters'
import { USER_ROLES } from '@/utils/constants'
import { Plus, Edit2, Trash2, ChevronDown, Eye, EyeOff } from 'lucide-react'

// Backend AdminRoleName → Türkçe etiket
const ROLE_LABELS = {
  admin: 'Yönetici',
  personnel: 'Personel',
  // Geriye dönük uyumluluk
  Admin: 'Yönetici',
  Employee: 'Personel',
  Customer: 'Müşteri',
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleOpen, setRoleOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  // Form alanları
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('personnel')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showPwdConfirm, setShowPwdConfirm] = useState(false)

  const limit = 10

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await userService.getAll({ page, limit, search, role: roleFilter })
      setUsers(res.items)
      setTotalItems(res.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const resetForm = () => {
    setName('')
    setEmail('')
    setRole('personnel')
    setPassword('')
    setPasswordConfirm('')
    setShowPwd(false)
    setShowPwdConfirm(false)
    setSaveError('')
  }

  const handleOpenCreate = () => {
    setEditingUser(null)
    resetForm()
    setIsModalOpen(true)
  }

  const handleOpenEdit = (u) => {
    setEditingUser(u)
    setName(u.name || '')
    setEmail(u.email || '')
    setRole(u.role || 'personnel')
    setPassword('')
    setPasswordConfirm('')
    setShowPwd(false)
    setShowPwdConfirm(false)
    setSaveError('')
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError('')

    // Yeni kullanıcı validasyonu
    if (!editingUser) {
      if (!password || password.length < 8) {
        setSaveError('Şifre en az 8 karakter olmalıdır.')
        return
      }
      if (password !== passwordConfirm) {
        setSaveError('Şifreler eşleşmiyor.')
        return
      }
    }

    setSaving(true)
    try {
      if (editingUser) {
        // Güncelleme: sadece isim ve rol değişebilir
        await userService.update(editingUser.id, { name, role })
      } else {
        // Yeni kullanıcı oluştur
        await userService.create({ name, email, password, password_confirm: passwordConfirm, role })
      }
      setIsModalOpen(false)
      resetForm()
      loadUsers()
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Bir hata oluştu.'
      setSaveError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await userService.delete(deleteId)
    } catch (err) {
      console.error(err)
    }
    setDeleteId(null)
    loadUsers()
  }

  const columns = [
    {
      header: 'Kullanıcı',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gradient-brand text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {getInitials(row.name)}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Rol',
      accessor: 'role',
      render: (row) => (
        <Badge
          color={row.role === 'admin' || row.role === 'Admin' ? 'indigo' : 'blue'}
          label={ROLE_LABELS[row.role] || row.role}
        />
      ),
    },
    {
      header: 'Durum',
      accessor: 'status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'Kayıt Tarihi',
      accessor: 'createdAt',
      render: (row) => {
        if (!row.createdAt) return '-'
        try {
          return formatDate(row.createdAt)
        } catch {
          return '-'
        }
      },
    },
    {
      header: 'İşlemler',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg"
            title="Düzenle"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Sil"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kullanıcı Yönetimi</h1>
          <p className="page-subtitle">Sistem yöneticilerini ve personelleri yönetin.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
            className="select w-40 text-xs py-1.5"
          >
            <option value="">Tüm Roller</option>
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
            ))}
          </select>

          <button onClick={handleOpenCreate} className="btn btn-primary">
            <Plus size={16} /> Kullanıcı Ekle
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchValue={search}
        onSearchChange={(val) => { setSearch(val); setPage(1) }}
        searchPlaceholder="İsim veya e-posta ile ara..."
        page={page}
        totalPages={Math.ceil(totalItems / limit)}
        totalItems={totalItems}
        itemsPerPage={limit}
        onPageChange={setPage}
      />

      {/* Kullanıcı Ekle / Düzenle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm() }}
        title={editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}
        footer={
          <>
            <button onClick={() => { setIsModalOpen(false); resetForm() }} className="btn btn-secondary">
              İptal
            </button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          {saveError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
              {saveError}
            </div>
          )}

          {/* Ad Soyad */}
          <div>
            <label className="label">Ad Soyad *</label>
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Ahmet Yılmaz"
            />
          </div>

          {/* E-posta – sadece yeni kullanıcıda */}
          {!editingUser && (
            <div>
              <label className="label">E-posta Adresi *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="ornek@site.com"
              />
            </div>
          )}

          {/* Rol */}
          <div>
            <label className="label">Rol</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleOpen(!roleOpen)}
                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm text-slate-700 shadow-sm flex items-center justify-between transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
              >
                {ROLE_LABELS[role] || role}
                <ChevronDown size={16} className={`transition ${roleOpen ? 'rotate-180' : ''}`} />
              </button>

              {roleOpen && (
                <div className="absolute z-30 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  {USER_ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setRole(r); setRoleOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      {ROLE_LABELS[r] || r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Şifre – yeni kullanıcıda zorunlu */}
          {!editingUser && (
            <>
              <div>
                <label className="label">Şifre * <span className="text-slate-400 font-normal">(min. 8 karakter)</span></label>
                <div className="relative flex items-center">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Şifre Tekrar *</label>
                <div className="relative flex items-center">
                  <input
                    type={showPwdConfirm ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="input pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdConfirm(!showPwdConfirm)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPwdConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Kullanıcı Silinsin mi?"
        message="Bu kullanıcı veritabanından kalıcı olarak silinecektir. İşlemi onaylıyor musunuz?"
      />
    </div>
  )
}
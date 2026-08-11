import { useState, useEffect, useCallback } from 'react'
import DataTable from '@/components/common/DataTable'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { userService } from '@/services/userService'
import { getInitials, formatDate } from '@/utils/formatters'
import { USER_ROLES } from '@/utils/constants'
import { Plus, Edit2, Trash2, ChevronDown } from 'lucide-react'

const ROLE_LABELS = {
  Admin: 'Yönetici',
  Employee: 'Personel',
  Customer: 'Müşteri',
  Guest: 'Misafir',
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleOpen, setRoleOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Customer')
  const [status, setStatus] = useState('active')

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

  const handleOpenCreate = () => {
    setEditingUser(null)
    setName('')
    setEmail('')
    setRole('Customer')
    setStatus('active')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (u) => {
    setEditingUser(u)
    setName(u.name)
    setEmail(u.email)
    setRole(u.role)
    setStatus(u.status)
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (editingUser) {
      await userService.update(editingUser.id, { name, email, role, status })
    }
    setIsModalOpen(false)
    loadUsers()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await userService.delete(deleteId)
    setDeleteId(null)
    loadUsers()
  }

  const columns = [
    {
      header: 'Kullanıcı',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gradient-brand text-white flex items-center justify-center text-xs font-bold">
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
      render: (row) => <Badge color={row.role === 'Admin' ? 'indigo' : row.role === 'Employee' ? 'blue' : 'slate'} label={ROLE_LABELS[row.role] || row.role} />,
    },
    {
      header: 'Durum',
      accessor: 'status',
      render: (row) => <Badge status={row.status} />,
    },
    { header: 'Kayıt Tarihi', accessor: 'createdAt', render: (row) => formatDate(row.createdAt) },
    {
      header: 'İşlemler',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenEdit(row)} className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg">
            <Edit2 size={16} />
          </button>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
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
          <p className="page-subtitle">Sistem yöneticilerini, personelleri ve müşterileri yönetin.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
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
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder="İsim veya e-posta ile ara..."
        page={page}
        totalPages={Math.ceil(totalItems / limit)}
        totalItems={totalItems}
        itemsPerPage={limit}
        onPageChange={setPage}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Kullanıcıyı Düzenle' : 'Kullanıcı Ekle'}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">İptal</button>
            <button onClick={handleSave} className="btn btn-primary">Kaydet</button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Ad Soyad *</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">E-posta Adresi *</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="label">Rol</label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleOpen(!roleOpen)}
                  className="
                      w-full
                      h-11
                      bg-white
                      border
                      border-slate-200
                      rounded-xl
                      px-4
                      text-sm
                      text-slate-700
                      shadow-sm
                      flex
                      items-center
                      justify-between
                      transition
                      focus:border-brand-500
                      focus:ring-4
                      focus:ring-brand-500/10
                    "
                >
                  {ROLE_LABELS[role]}

                  <ChevronDown
                    size={16}
                    className={`transition ${roleOpen ? 'rotate-180' : ''}`}
                  />
                </button>


                {roleOpen && (
                  <div className="
                        absolute
                        z-30
                        mt-2
                        w-full
                        bg-white
                        border
                        border-slate-200
                        rounded-xl
                        shadow-lg
                        overflow-hidden
                    ">
                    {USER_ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setRole(r)
                          setRoleOpen(false)
                        }}
                        className="
                                    w-full
                                    text-left
                                    px-4
                                    py-2.5
                                    text-sm
                                    text-slate-700
                                    hover:bg-slate-50
                                "
                      >
                        {ROLE_LABELS[r]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>


            <div>
              <label className="label">Durum</label>

              <div className="relative">

                <button
                  type="button"
                  onClick={() => setStatusOpen(!statusOpen)}
                  className="
                    w-full
                    h-11
                    bg-white
                    border
                    border-slate-200
                    rounded-xl
                    px-4
                    text-sm
                    text-slate-700
                    shadow-sm
                    flex
                    items-center
                    justify-between
                    transition
                    focus:border-brand-500
                    focus:ring-4
                    focus:ring-brand-500/10
                 "
                >

                  {status === 'active' ? (
                    <span>🟢 Aktif</span>
                  ) : (
                    <span>🔴 Pasif</span>
                  )}

                  <ChevronDown
                    size={16}
                    className={`transition ${statusOpen ? 'rotate-180' : ''}`}
                  />

                </button>


                {statusOpen && (

                  <div
                    className="
                      absolute
                      z-30
                      mt-2
                      w-full
                      bg-white
                      border
                      border-slate-200
                      rounded-xl
                      shadow-lg
                      overflow-hidden
                    "
                  >

                    <button
                      type="button"
                      onClick={() => {
                        setStatus('active')
                        setStatusOpen(false)
                      }}
                      className="
                        w-full
                        text-left
                        px-4
                        py-2.5
                        text-sm
                        text-slate-700
                        hover:bg-slate-50
                      "
                    >
                      🟢 Aktif
                    </button>


                    <button
                      type="button"
                      onClick={() => {
                        setStatus('inactive')
                        setStatusOpen(false)
                      }}
                      className="
                        w-full
                        text-left
                        px-4
                        py-2.5
                        text-sm
                        text-slate-700
                        hover:bg-slate-50
                      "
                    >
                      🔴 Pasif
                    </button>

                  </div>

                )}

              </div>

            </div>

          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Kullanıcı Silinsin mi?"
        message="Bu kullanıcı profilini silmek istediğinize emin misiniz?"
      />
    </div>
  )
}
import { useState } from 'react'
import { mockRoles, MODULES, PERMISSIONS } from '@/mock/roles'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'
import { Shield, Plus, Edit2 } from 'lucide-react'

const MODULE_TR = {
  Dashboard: 'Kontrol Paneli',
  Products: 'Ürünler',
  Categories: 'Kategoriler',
  Brands: 'Markalar',
  Orders: 'Siparişler',
  Stock: 'Stok',
  Users: 'Kullanıcılar',
  Roles: 'Roller & İzinler',
  Reports: 'Raporlar',
  Settings: 'Ayarlar',
}

const PERM_TR = {
  view: 'Görüntüleme',
  create: 'Ekleme',
  edit: 'Düzenleme',
  delete: 'Silme',
}

export default function RolesPage() {
  const [roles, setRoles] = useState(mockRoles)
  const [selectedRole, setSelectedRole] = useState(mockRoles[0])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDesc, setNewRoleDesc] = useState('')

  const handleTogglePermission = (module, perm) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== selectedRole.id) return r
        const currentModulePerms = r.permissions[module] || []
        const hasPerm = currentModulePerms.includes(perm)
        const updated = hasPerm
          ? currentModulePerms.filter((p) => p !== perm)
          : [...currentModulePerms, perm]

        const newRole = {
          ...r,
          permissions: { ...r.permissions, [module]: updated },
        }
        if (selectedRole.id === r.id) setSelectedRole(newRole)
        return newRole
      })
    )
  }

  const handleCreateRole = (e) => {
    e.preventDefault()
    const newRole = {
      id: Date.now(),
      name: newRoleName,
      description: newRoleDesc,
      color: 'blue',
      permissions: Object.fromEntries(MODULES.map((m) => [m, ['view']])),
      userCount: 0,
    }
    setRoles((prev) => [...prev, newRole])
    setSelectedRole(newRole)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Roller & İzinler</h1>
          <p className="page-subtitle">Modül bazlı yetkilendirmeleri ve erişim izinlerini ayarlayın.</p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Yeni Rol Oluştur
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role Cards List */}
        <div className="space-y-3">
          {roles.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedRole(r)}
              className={`card p-4 cursor-pointer transition-all duration-200 ${selectedRole.id === r.id
                  ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20'
                  : 'hover:border-slate-300'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-brand-500" />
                  <h3 className="font-bold text-slate-800 text-sm">{r.name}</h3>
                </div>
                <Badge color={r.color} label={`${r.userCount} Kullanıcı`} />
              </div>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{r.description}</p>
            </div>
          ))}
        </div>

        {/* Permission Matrix */}
        <div className="lg:col-span-3 card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Shield size={20} className="text-brand-500" />
                {selectedRole.name} İzinleri
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{selectedRole.description}</p>
            </div>
            <button className="btn btn-secondary btn-sm flex items-center gap-1">
              <Edit2 size={14} /> Rolü Düzenle
            </button>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Modül</th>
                  {PERMISSIONS.map((p) => (
                    <th key={p} className="text-center">
                      {PERM_TR[p] || p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map((m) => {
                  const currentModulePerms = selectedRole.permissions[m] || []
                  return (
                    <tr key={m}>
                      <td className="font-semibold text-slate-800">{MODULE_TR[m] || m}</td>
                      {PERMISSIONS.map((p) => {
                        const checked = currentModulePerms.includes(p)
                        return (
                          <td key={p} className="text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleTogglePermission(m, p)}
                              className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 cursor-pointer"
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni Rol Oluştur"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              İptal
            </button>
            <button onClick={handleCreateRole} className="btn btn-primary">
              Oluştur
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateRole} className="space-y-4">
          <div>
            <label className="label">Rol Adı *</label>
            <input
              type="text"
              required
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="input"
              placeholder="Örn. İçerik Yöneticisi"
            />
          </div>
          <div>
            <label className="label">Açıklama</label>
            <textarea
              rows={3}
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="input"
              placeholder="Rol sorumlulukları..."
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}

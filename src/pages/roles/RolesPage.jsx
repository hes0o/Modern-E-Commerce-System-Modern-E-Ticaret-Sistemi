import { useState, useEffect } from 'react'
import api from '@/services/api'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'
import { Shield, Plus, Edit2 } from 'lucide-react'

const PERM_TR = {
  view: 'Görüntüleme',
  create: 'Ekleme',
  edit: 'Düzenleme',
  delete: 'Silme',
  read: 'Görüntüleme',
  update: 'Düzenleme',
}

export default function RolesPage() {
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDesc, setNewRoleDesc] = useState('')
  const [loading, setLoading] = useState(true)

  // Group permissions by module for the matrix view
  const permissionModules = {}
  permissions.forEach((p) => {
    const [module, action] = (p.codename || '').split('.')
    if (!permissionModules[module]) permissionModules[module] = []
    if (action && !permissionModules[module].includes(action)) {
      permissionModules[module].push(action)
    }
  })
  const modules = Object.keys(permissionModules)
  const allActions = [...new Set(permissions.map((p) => (p.codename || '').split('.')[1]).filter(Boolean))]

  const fetchData = async () => {
    try {
      setLoading(true)
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/api/admin/rbac/roles'),
        api.get('/api/admin/rbac/permissions'),
      ])
      const fetchedRoles = rolesRes.data.data || []
      const fetchedPerms = permsRes.data.data || []
      setRoles(fetchedRoles)
      setPermissions(fetchedPerms)
      if (fetchedRoles.length > 0 && !selectedRole) {
        setSelectedRole(fetchedRoles[0])
      }
    } catch (err) {
      console.error('Failed to load roles/permissions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const roleHasPermission = (role, module, action) => {
    if (!role?.permissions) return false
    const codename = `${module}.${action}`
    return role.permissions.some((p) => (p.codename || p) === codename)
  }

  const handleTogglePermission = async (module, action) => {
    if (!selectedRole) return
    const codename = `${module}.${action}`
    const has = roleHasPermission(selectedRole, module, action)

    // Build updated permission_ids list
    const allPermsForRole = selectedRole.permissions || []
    let newPermIds
    if (has) {
      newPermIds = allPermsForRole
        .filter((p) => (p.codename || p) !== codename)
        .map((p) => p.id || p)
    } else {
      const permObj = permissions.find((p) => p.codename === codename)
      if (!permObj) return
      newPermIds = [...allPermsForRole.map((p) => p.id || p), permObj.id]
    }

    try {
      await api.put(`/api/admin/rbac/roles/${selectedRole.id}/permissions`, {
        permission_ids: newPermIds,
      })
      fetchData()
    } catch (err) {
      console.error('Failed to update permissions:', err)
    }
  }

  const handleCreateRole = async (e) => {
    e.preventDefault()
    // Note: Backend may not have a create role endpoint yet
    // For now just close the modal
    setIsModalOpen(false)
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Yükleniyor...</div>
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
              className={`card p-4 cursor-pointer transition-all duration-200 ${selectedRole?.id === r.id
                  ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20'
                  : 'hover:border-slate-300'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-brand-500" />
                  <h3 className="font-bold text-slate-800 text-sm">{r.name}</h3>
                </div>
                <Badge color="blue" label={`${r.user_count || 0} Kullanıcı`} />
              </div>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{r.description}</p>
            </div>
          ))}
        </div>

        {/* Permission Matrix */}
        {selectedRole && (
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
                    {allActions.map((a) => (
                      <th key={a} className="text-center">
                        {PERM_TR[a] || a}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((m) => (
                    <tr key={m}>
                      <td className="font-semibold text-slate-800 capitalize">{m}</td>
                      {allActions.map((a) => {
                        const exists = permissions.some((p) => p.codename === `${m}.${a}`)
                        if (!exists) return <td key={a} className="text-center text-slate-300">—</td>
                        const checked = roleHasPermission(selectedRole, m, a)
                        return (
                          <td key={a} className="text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleTogglePermission(m, a)}
                              className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 cursor-pointer"
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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

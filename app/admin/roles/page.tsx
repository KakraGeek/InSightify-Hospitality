'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Edit, Trash2, Shield, Search, Filter, Users, 
  Eye, Search as SearchIcon, FileText, Settings, BarChart3
} from 'lucide-react'
import { Button } from '../../components/components/ui/button'
import { Input } from '../../components/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/components/ui/select'

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isSystem: boolean
  createdAt: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface CreateRoleForm {
  name: string
  description: string
  permissions: string[]
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // User Management
  { id: 'users:read', name: 'View Users', description: 'View user list and profiles', category: 'User Management' },
  { id: 'users:create', name: 'Create Users', description: 'Create new user accounts', category: 'User Management' },
  { id: 'users:update', name: 'Edit Users', description: 'Modify existing user accounts', category: 'User Management' },
  { id: 'users:delete', name: 'Delete Users', description: 'Remove user accounts', category: 'User Management' },
  
  // Data Management
  { id: 'data:read', name: 'View Data', description: 'Access to view uploaded data and KPIs', category: 'Data Management' },
  { id: 'data:upload', name: 'Upload Data', description: 'Upload CSV, PDF, and other data files', category: 'Data Management' },
  { id: 'data:process', name: 'Process Data', description: 'Run data processing and KPI calculations', category: 'Data Management' },
  { id: 'data:delete', name: 'Delete Data', description: 'Remove uploaded data files', category: 'Data Management' },
  
  // Reports
  { id: 'reports:read', name: 'View Reports', description: 'Access to view generated reports', category: 'Reports' },
  { id: 'reports:create', name: 'Create Reports', description: 'Create new custom reports', category: 'Reports' },
  { id: 'reports:edit', name: 'Edit Reports', description: 'Modify existing reports', category: 'Reports' },
  { id: 'reports:delete', name: 'Delete Reports', description: 'Remove reports', category: 'Reports' },
  { id: 'reports:export', name: 'Export Reports', description: 'Export reports to PDF/CSV', category: 'Reports' },
  
  // Analytics
  { id: 'analytics:view', name: 'View Analytics', description: 'Access to dashboard and analytics', category: 'Analytics' },
  { id: 'analytics:create', name: 'Create Analytics', description: 'Create custom analytics views', category: 'Analytics' },
  
  // System
  { id: 'system:settings', name: 'System Settings', description: 'Access to system configuration', category: 'System' },
  { id: 'system:logs', name: 'System Logs', description: 'View system logs and audit trails', category: 'System' },
  { id: 'system:backup', name: 'System Backup', description: 'Manage system backups', category: 'System' }
]

export default function AdminRolesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [roles, setRoles] = useState<Role[]>([])
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [createForm, setCreateForm] = useState<CreateRoleForm>({
    name: '',
    description: '',
    permissions: []
  })
  const [loading, setLoading] = useState(false)

  // Check admin access
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  // Mock roles data (replace with API call)
  useEffect(() => {
    const mockRoles: Role[] = [
      {
        id: '1',
        name: 'admin',
        description: 'Full system access with all permissions',
        permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
        userCount: 1,
        isSystem: true,
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'analyst',
        description: 'Data analysis and report creation with limited user management',
        permissions: [
          'data:read', 'data:upload', 'data:process', 'data:delete',
          'reports:read', 'reports:create', 'reports:edit', 'reports:delete', 'reports:export',
          'analytics:view', 'analytics:create', 'users:read'
        ],
        userCount: 2,
        isSystem: false,
        createdAt: '2024-02-20'
      },
      {
        id: '3',
        name: 'viewer',
        description: 'Read-only access to reports and analytics',
        permissions: ['data:read', 'reports:read', 'analytics:view'],
        userCount: 1,
        isSystem: false,
        createdAt: '2024-03-10'
      },
      {
        id: '4',
        name: 'manager',
        description: 'Department management with reporting capabilities',
        permissions: [
          'data:read', 'data:upload', 'data:process',
          'reports:read', 'reports:create', 'reports:edit', 'reports:export',
          'analytics:view', 'analytics:create', 'users:read'
        ],
        userCount: 0,
        isSystem: false,
        createdAt: '2024-04-05'
      }
    ]
    
    setRoles(mockRoles)
    setFilteredRoles(mockRoles)
  }, [])

  // Filter roles based on search
  useEffect(() => {
    let filtered = roles
    
    if (searchTerm) {
      filtered = filtered.filter(role => 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredRoles(filtered)
  }, [roles, searchTerm])

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Mock API call - replace with actual API
      const newRole: Role = {
        id: Date.now().toString(),
        name: createForm.name.toLowerCase(),
        description: createForm.description,
        permissions: createForm.permissions,
        userCount: 0,
        isSystem: false,
        createdAt: new Date().toISOString()
      }
      
      setRoles(prev => [...prev, newRole])
      setCreateForm({ name: '', description: '', permissions: [] })
      setShowCreateForm(false)
      
      alert('Role created successfully!')
    } catch (error) {
      console.error('Error creating role:', error)
      alert('Error creating role. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (role: Role) => {
    setLoading(true)
    
    try {
      // Mock API call - replace with actual API
      setRoles(prev => prev.map(r => r.id === role.id ? role : r))
      setEditingRole(null)
      
      alert('Role updated successfully!')
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Error updating role. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (!role) return
    
    if (role.isSystem) {
      alert('System roles cannot be deleted.')
      return
    }
    
    if (role.userCount > 0) {
      alert('Cannot delete role that is assigned to users. Please reassign users first.')
      return
    }
    
    if (!confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      return
    }
    
    setLoading(true)
    
    try {
      // Mock API call - replace with actual API
      setRoles(prev => prev.filter(r => r.id !== roleId))
      
      alert('Role deleted successfully!')
    } catch (error) {
      console.error('Error deleting role:', error)
      alert('Error deleting role. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPermissionCategoryIcon = (category: string) => {
    switch (category) {
      case 'User Management': return <Users className="h-4 w-4" />
      case 'Data Management': return <FileText className="h-4 w-4" />
      case 'Reports': return <BarChart3 className="h-4 w-4" />
      case 'Analytics': return <SearchIcon className="h-4 w-4" />
      case 'System': return <Settings className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const getPermissionCategoryColor = (category: string) => {
    switch (category) {
      case 'User Management': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Data Management': return 'bg-green-100 text-green-800 border-green-200'
      case 'Reports': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Analytics': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'System': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Role Management</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Custom Roles</p>
                <p className="text-2xl font-bold text-gray-900">{roles.filter(r => !r.isSystem).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Roles</p>
                <p className="text-2xl font-bold text-gray-900">{roles.filter(r => r.isSystem).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                <p className="text-2xl font-bold text-gray-900">{AVAILABLE_PERMISSIONS.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Create Role Button */}
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>
        </div>

        {/* Create Role Form */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Role</h3>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                  <Input
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., manager, supervisor"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Input
                    required
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the role"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-md p-4">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <label key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={createForm.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCreateForm(prev => ({
                              ...prev,
                              permissions: [...prev.permissions, permission.id]
                            }))
                          } else {
                            setCreateForm(prev => ({
                              ...prev,
                              permissions: prev.permissions.filter(p => p !== permission.id)
                            }))
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                        <div className="text-xs text-gray-500">{permission.description}</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPermissionCategoryColor(permission.category)}`}>
                          {getPermissionCategoryIcon(permission.category)}
                          <span className="ml-1">{permission.category}</span>
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  {loading ? 'Creating...' : 'Create Role'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Roles Table */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 capitalize">{role.name}</div>
                          <div className="text-sm text-gray-500">ID: {role.id}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">{role.description}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permissionId) => {
                          const permission = AVAILABLE_PERMISSIONS.find(p => p.id === permissionId)
                          if (!permission) return null
                          
                          return (
                            <span 
                              key={permissionId}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPermissionCategoryColor(permission.category)}`}
                            >
                              {getPermissionCategoryIcon(permission.category)}
                              <span className="ml-1">{permission.name}</span>
                            </span>
                          )
                        })}
                        {role.permissions.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        role.isSystem 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {role.isSystem ? 'System' : 'Custom'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingRole(role)}
                          className="text-xs"
                          disabled={role.isSystem}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                          disabled={role.isSystem || role.userCount > 0}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRoles.length === 0 && (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search.'
                  : 'Get started by creating a new role.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Edit Role Modal */}
        {editingRole && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
              <div className="mt-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Role: {editingRole.name}</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateRole(editingRole); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                      <Input
                        value={editingRole.name}
                        onChange={(e) => setEditingRole(prev => prev ? { ...prev, name: e.target.value } : null)}
                        required
                        disabled={editingRole.isSystem}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <Input
                        value={editingRole.description}
                        onChange={(e) => setEditingRole(prev => prev ? { ...prev, description: e.target.value } : null)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-md p-4">
                        {AVAILABLE_PERMISSIONS.map((permission) => (
                          <label key={permission.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={editingRole.permissions.includes(permission.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditingRole(prev => prev ? {
                                    ...prev,
                                    permissions: [...prev.permissions, permission.id]
                                  } : null)
                                } else {
                                  setEditingRole(prev => prev ? {
                                    ...prev,
                                    permissions: prev.permissions.filter(p => p !== permission.id)
                                  } : null)
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                              <div className="text-xs text-gray-500">{permission.description}</div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPermissionCategoryColor(permission.category)}`}>
                                {getPermissionCategoryIcon(permission.category)}
                                <span className="ml-1">{permission.category}</span>
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        {loading ? 'Updating...' : 'Update Role'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setEditingRole(null)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

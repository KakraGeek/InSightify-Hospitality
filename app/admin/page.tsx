'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, Shield, Settings, BarChart3, FileText, 
  Database, Activity, AlertTriangle, Clock, TrendingUp,
  UserPlus, UserCheck, UserX, ShieldCheck, ShieldX
} from 'lucide-react'
import { Button } from '../../components/components/ui/button'

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalRoles: number
  systemRoles: number
  customRoles: number
  totalReports: number
  totalDataFiles: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  lastBackup: string
  uptime: string
}

// Extend the session type to include role
interface ExtendedSession {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string }
  const router = useRouter()
  
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 4,
    systemRoles: 3,
    customRoles: 1,
    totalReports: 0,
    totalDataFiles: 0,
    systemHealth: 'healthy',
    lastBackup: '2024-12-15T10:00:00Z',
    uptime: '15 days, 8 hours'
  })

  // Check admin access
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  // Mock system stats (replace with API call)
  useEffect(() => {
    const mockStats: SystemStats = {
      totalUsers: 4,
      activeUsers: 3,
      totalRoles: 4,
      systemRoles: 3,
      customRoles: 1,
      totalReports: 12,
      totalDataFiles: 8,
      systemHealth: 'healthy',
      lastBackup: '2024-12-15T10:00:00Z',
      uptime: '15 days, 8 hours'
    }
    
    setSystemStats(mockStats)
  }, [])

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <ShieldCheck className="h-5 w-5" />
      case 'warning': return <AlertTriangle className="h-5 w-5" />
      case 'critical': return <ShieldX className="h-5 w-5" />
      default: return <Shield className="h-5 w-5" />
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">System administration and management</p>
        </div>

        {/* System Health Overview */}
        <div className="bg-white p-6 rounded-lg border shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(systemStats.systemHealth)}`}>
              {getHealthIcon(systemStats.systemHealth)}
              <span className="ml-2 capitalize">{systemStats.systemHealth}</span>
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-lg font-semibold text-gray-900">{systemStats.uptime}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Backup</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(systemStats.lastBackup).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-lg font-semibold text-gray-900">All Systems Operational</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                <p className="text-xs text-gray-500">{systemStats.activeUsers} active</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalRoles}</p>
                <p className="text-xs text-gray-500">{systemStats.customRoles} custom</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalReports}</p>
                <p className="text-xs text-gray-500">Generated reports</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Data Files</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalDataFiles}</p>
                <p className="text-xs text-gray-500">Uploaded files</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Functions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Management */}
          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Manage user accounts and access</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Users:</span>
                <span className="font-medium">{systemStats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Users:</span>
                <span className="font-medium text-green-600">{systemStats.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Inactive Users:</span>
                <span className="font-medium text-red-600">{systemStats.totalUsers - systemStats.activeUsers}</span>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <Link href="/admin/users">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
            </div>
          </div>

          {/* Role Management */}
          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Role Management</h3>
                <p className="text-sm text-gray-600">Configure roles and permissions</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Roles:</span>
                <span className="font-medium">{systemStats.totalRoles}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">System Roles:</span>
                <span className="font-medium text-blue-600">{systemStats.systemRoles}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Custom Roles:</span>
                <span className="font-medium text-green-600">{systemStats.customRoles}</span>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <Link href="/admin/roles">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Roles
                </Button>
              </Link>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
                <p className="text-sm text-gray-600">Configure system preferences</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">System Health:</span>
                <span className={`font-medium ${getHealthColor(systemStats.systemHealth)} px-2 py-1 rounded-full text-xs`}>
                  {systemStats.systemHealth}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last Backup:</span>
                <span className="font-medium">{new Date(systemStats.lastBackup).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium">{systemStats.uptime}</span>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <Link href="/settings">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <UserPlus className="h-4 w-4 text-green-600 mr-3" />
                <span className="text-sm text-gray-700">New user "Hotel Manager" created</span>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-blue-600 mr-3" />
                <span className="text-sm text-gray-700">Role "manager" permissions updated</span>
              </div>
              <span className="text-xs text-gray-500">4 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Database className="h-4 w-4 text-purple-600 mr-3" />
                <span className="text-sm text-gray-700">System backup completed successfully</span>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <UserCheck className="h-4 w-4 text-green-600 mr-3" />
                <span className="text-sm text-gray-700">User "Data Analyst" logged in</span>
              </div>
              <span className="text-xs text-gray-500">2 days ago</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Create New User
            </Button>
            
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Shield className="h-4 w-4 mr-2" />
              Create New Role
            </Button>
            
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Database className="h-4 w-4 mr-2" />
              Run System Backup
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

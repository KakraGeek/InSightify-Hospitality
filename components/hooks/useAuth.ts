'use client'

import { useSession } from 'next-auth/react'
import { ROLES, PERMISSIONS, type Role, type Permission } from '@/lib/auth/guard'

export function useAuth() {
  const { data: session, status, update } = useSession()
  
  const userRoles = (session?.user as any)?.roles || []
  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'
  
  // Role checking functions
  const hasRole = (role: Role): boolean => {
    if (!isAuthenticated) return false
    
    // Check role hierarchy
    const roleHierarchy: Record<Role, Role[]> = {
      [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER],
      [ROLES.ANALYST]: [ROLES.ANALYST, ROLES.VIEWER],
      [ROLES.VIEWER]: [ROLES.VIEWER]
    }
    
    return userRoles.some((userRole: string) => 
      roleHierarchy[role]?.includes(userRole as Role)
    ) || false
  }
  
  const hasPermission = (permission: Permission): boolean => {
    if (!isAuthenticated) return false
    
    const allowedRoles = PERMISSIONS[permission] as readonly Role[]
    return userRoles.some((role: string) => allowedRoles.includes(role as Role))
  }
  
  // Convenience getters
  const isAdmin = hasRole(ROLES.ADMIN)
  const isAnalyst = hasRole(ROLES.ANALYST)
  const isViewer = hasRole(ROLES.VIEWER)
  
  // Permission getters
  const canManageUsers = hasPermission('MANAGE_USERS')
  const canManageRoles = hasPermission('MANAGE_ROLES')
  const canIngestData = hasPermission('INGEST_DATA')
  const canViewRawData = hasPermission('VIEW_RAW_DATA')
  const canCreateReports = hasPermission('CREATE_REPORTS')
  const canViewAllReports = hasPermission('VIEW_ALL_REPORTS')
  const canViewAssignedReports = hasPermission('VIEW_ASSIGNED_REPORTS')
  const canManageSettings = hasPermission('MANAGE_SETTINGS')
  const canViewAnalytics = hasPermission('VIEW_ANALYTICS')
  
  return {
    // Session state
    session,
    status,
    isAuthenticated,
    isLoading,
    update,
    
    // User info
    user: session?.user,
    userRoles,
    
    // Role checking
    hasRole,
    hasPermission,
    
    // Role convenience getters
    isAdmin,
    isAnalyst,
    isViewer,
    
    // Permission convenience getters
    canManageUsers,
    canManageRoles,
    canIngestData,
    canViewRawData,
    canCreateReports,
    canViewAllReports,
    canViewAssignedReports,
    canManageSettings,
    canViewAnalytics,
    
    // Constants
    ROLES,
    PERMISSIONS
  }
}

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from './options'

// Define the role hierarchy and permissions
export const ROLES = {
  ADMIN: 'admin',
  ANALYST: 'analyst', 
  VIEWER: 'viewer'
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

// Role hierarchy - higher roles inherit lower permissions
export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER],
  [ROLES.ANALYST]: [ROLES.ANALYST, ROLES.VIEWER],
  [ROLES.VIEWER]: [ROLES.VIEWER]
}

// Permission definitions for different app areas
export const PERMISSIONS: Record<string, readonly Role[]> = {
  // User management
  MANAGE_USERS: [ROLES.ADMIN],
  MANAGE_ROLES: [ROLES.ADMIN],
  
  // Data operations
  INGEST_DATA: [ROLES.ADMIN, ROLES.ANALYST],
  VIEW_RAW_DATA: [ROLES.ADMIN, ROLES.ANALYST],
  
  // Reports
  CREATE_REPORTS: [ROLES.ADMIN, ROLES.ANALYST],
  VIEW_ALL_REPORTS: [ROLES.ADMIN, ROLES.ANALYST],
  VIEW_ASSIGNED_REPORTS: [ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER],
  
  // System settings
  MANAGE_SETTINGS: [ROLES.ADMIN],
  VIEW_ANALYTICS: [ROLES.ADMIN, ROLES.ANALYST]
} as const

export type Permission = keyof typeof PERMISSIONS

/**
 * Check if a user has a specific role
 */
export function hasRole(userRoles: string[], requiredRole: Role): boolean {
  return userRoles.some(userRole => 
    ROLE_HIERARCHY[userRole as Role]?.includes(requiredRole)
  ) || false
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRoles: string[], permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission]
  return userRoles.some((role: string) => allowedRoles.includes(role as Role))
}

/**
 * Get user session with role validation
 */
export async function getSessionWithRoles() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return null
  }
  
  const userRoles = (session.user as { roles?: string[] }).roles || []
  return { ...session, userRoles }
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth() {
  const session = await getSessionWithRoles()
  if (!session) {
    redirect('/login')
  }
  return session
}

/**
 * Require a specific role - redirects to dashboard if insufficient permissions
 */
export async function requireRole(role: Role) {
  const session = await requireAuth()
  const userRoles = session.userRoles
  
  if (!hasRole(userRoles, role)) {
    redirect('/dashboard?error=insufficient_permissions')
  }
  
  return session
}

/**
 * Require a specific permission - redirects to dashboard if insufficient permissions
 */
export async function requirePermission(permission: Permission) {
  const session = await requireAuth()
  const userRoles = session.userRoles
  
  if (!hasPermission(userRoles, permission)) {
    redirect('/dashboard?error=insufficient_permissions')
  }
  
  return session
}

/**
 * Higher-order function for API route protection
 */
export function withRole<T extends unknown[], R>(
  role: Role, 
  handler: (session: Awaited<ReturnType<typeof getSessionWithRoles>>, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const session = await requireRole(role)
    return handler(session, ...args)
  }
}

/**
 * Higher-order function for API route protection with permissions
 */
export function withPermission<T extends unknown[], R>(
  permission: Permission,
  handler: (session: Awaited<ReturnType<typeof getSessionWithRoles>>, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const session = await requirePermission(permission)
    return handler(session, ...args)
  }
}

/**
 * Check if user can access a route (for client-side checks)
 */
export function canAccessRoute(userRoles: string[], requiredRole: Role): boolean {
  return hasRole(userRoles, requiredRole)
}

/**
 * Check if user can perform an action (for client-side checks)
 */
export function canPerformAction(userRoles: string[], permission: Permission): boolean {
  return hasPermission(userRoles, permission)
}

'use client'
import React from 'react'

import { useAuth } from '@/components/hooks/useAuth'
import { ROLES, type Role } from '@/lib/auth/guard'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: Role
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback = <div>Loading...</div>,
  redirectTo = '/dashboard'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth()
  
  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (!isLoading && !isAuthenticated) {
      redirect('/login')
    }
    
    // If authenticated but doesn't have required role, redirect
    if (!isLoading && isAuthenticated && requiredRole && !hasRole(requiredRole)) {
      redirect(redirectTo)
    }
  }, [isAuthenticated, isLoading, hasRole, requiredRole, redirectTo])
  
  // Show loading state
  if (isLoading) {
    return <>{fallback}</>
  }
  
  // Show loading while redirecting
  if (!isAuthenticated) {
    return <>{fallback}</>
  }
  
  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>
  }
  
  // User is authenticated and has required role
  return <>{children}</>
}

// Convenience components for common role requirements
export function AdminOnly({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole={ROLES.ADMIN} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function AnalystOrHigher({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole={ROLES.ANALYST} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function ViewerOrHigher({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole={ROLES.VIEWER} {...props}>
      {children}
    </ProtectedRoute>
  )
}

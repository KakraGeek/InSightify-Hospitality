import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Route protection configuration
const PROTECTED_ROUTES = {
  // Admin-only routes
  '/admin': ['admin'],
  
  // Analyst+ routes (admin and analyst)
  '/ingest': ['admin', 'analyst'],
  '/reports/new': ['admin', 'analyst'],
  
  // Viewer+ routes (all authenticated users)
  '/dashboard': ['admin', 'analyst', 'viewer'],
  '/kpis': ['admin', 'analyst', 'viewer'],
  '/reports': ['admin', 'analyst', 'viewer'],
  
  // Protected routes that require any role
  '/protected': ['admin', 'analyst', 'viewer']
} as const

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Check if the current path requires authentication
  const requiredRoles = getRequiredRoles(pathname)
  
  if (requiredRoles.length > 0) {
    const token = await getToken({ req })
    
    if (!token) {
      // No token - redirect to login
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.search = `from=${encodeURIComponent(pathname + (search || ''))}`
      return NextResponse.redirect(url)
    }
    
    // Check if user has required role
    const userRoles: string[] = ((token as { roles?: string[] })?.roles as string[]) || []
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles.includes(role)
    )
    
    if (!hasRequiredRole) {
      // Insufficient permissions - redirect to dashboard with error
      const url = req.nextUrl.clone()
      url.pathname = '/dashboard'
      url.search = 'error=insufficient_permissions'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

function getRequiredRoles(pathname: string): string[] {
  // Check exact matches first
  if (PROTECTED_ROUTES[pathname as keyof typeof PROTECTED_ROUTES]) {
    return [...PROTECTED_ROUTES[pathname as keyof typeof PROTECTED_ROUTES]]
  }
  
  // Check prefix matches
  for (const [route, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return [...roles]
    }
  }
  
  // No protection required
  return []
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createAdminClient } from '@/lib/cron/helpers'

const PUBLIC_ROUTES = [
  '/',
  '/pricing',
  '/demo',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/callback',
  '/auth/invite',
  '/pending-approval',
  '/suspended',
]

const PUBLIC_API_PREFIXES = [
  '/api/webhooks',
  '/api/cron'
]

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. Allow public routes immediately (but still check if logged in for some)
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) ||
                       PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix))

  // 2. Refresh Supabase session
  const { supabaseResponse, user } = await updateSession(request)

  if (isPublicRoute) {
    if (user && (pathname === '/' || ['/login', '/signup', '/forgot-password'].includes(pathname))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // 3. No user → redirect to login for all other routes
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 4. Routes that need auth but NOT tenant check (onboarding)
  const isAuthOnlyRoute = [
    '/onboarding',
  ].includes(pathname)

  if (isAuthOnlyRoute) {
    // If user already has a tenant, redirect them appropriately
    const adminSupabase = createAdminClient()
    const { data: profile } = await adminSupabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (profile?.tenant_id) {
       const { data: tenant } = await adminSupabase
        .from('tenants')
        .select('status')
        .eq('id', profile.tenant_id)
        .single()

      if (tenant?.status === 'active') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else if (tenant?.status === 'pending_admin_approval') {
        return NextResponse.redirect(new URL('/pending-approval', request.url))
      }
    }
    return supabaseResponse
  }

  // 5. Protected Routes (Dashboard/Admin/API)
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/admin') ||
                          pathname.startsWith('/api')

  if (isProtectedRoute) {
    // Get profile using service role since user might not have claims yet
    const adminSupabase = createAdminClient()
    const { data: profile } = await adminSupabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    // No public.users record → user hasn't finished onboarding
    if (!profile) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Get tenant status
    const { data: tenant } = await adminSupabase
      .from('tenants')
      .select('status')
      .eq('id', profile.tenant_id)
      .single()

    if (!tenant || tenant.status === 'cancelled') {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Handle tenant status redirects
    if (tenant.status === 'pending_admin_approval') {
      if (pathname !== '/pending-approval') {
        return NextResponse.redirect(new URL('/pending-approval', request.url))
      }
    }

    if (tenant.status === 'suspended') {
      // Allow access to billing page to renew (if billing exists)
      const allowedSuspendedPaths = [
        '/dashboard/settings/billing',
        '/suspended',
        '/api/settings/billing',
        '/api/checkout',
      ]

      const isAllowedPath = allowedSuspendedPaths.some(path =>
        pathname.startsWith(path)
      )

      if (!isAllowedPath) {
        return NextResponse.redirect(new URL('/suspended', request.url))
      }
    }

    // Role-based access for /admin
    if (pathname.startsWith('/admin') && profile.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

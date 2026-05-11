import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@/lib/supabase/server'

const PUBLIC_ROUTES = [
  '/',
  '/pricing',
  '/demo',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/callback'
]

const PUBLIC_API_PREFIXES = [
  '/api/webhooks',
  '/api/cron'
]

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. Allow public routes immediately
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) ||
                       PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix))

  if (isPublicRoute) {
    // We still need to update session for auth pages to handle redirects if already logged in
    const { supabaseResponse, user } = await updateSession(request)

    if (user && (pathname === '/' || ['/login', '/signup', '/forgot-password'].includes(pathname))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (['/login', '/signup', '/forgot-password'].includes(pathname)) {
      return supabaseResponse
    }
    return NextResponse.next()
  }

  // 2. Refresh Supabase session
  const { supabaseResponse, user } = await updateSession(request)

  // 3. No user → redirect to login for all other routes
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. Routes that need auth but NOT tenant check (onboarding or status pages)
  const isAuthOnlyRoute = [
    '/onboarding',
    '/pending-approval',
    '/suspended'
  ].includes(pathname)

  if (isAuthOnlyRoute) {
    return supabaseResponse
  }

  // 5. Routes that need full auth + active tenant (Dashboard/Admin/API)
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/admin') ||
                          pathname.startsWith('/api')

  if (isProtectedRoute) {
    // Get profile using service role
    const supabase = await createClient(true)
    const { data: profile } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    // No public.users record → user hasn't finished onboarding/payment
    if (!profile) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Get tenant status
    const { data: tenant } = await supabase
      .from('tenants')
      .select('status')
      .eq('id', profile.tenant_id)
      .single()

    if (!tenant) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Handle tenant status redirects
    if (tenant.status === 'pending_admin_approval') {
      return NextResponse.redirect(new URL('/pending-approval', request.url))
    }
    if (tenant.status === 'suspended') {
      return NextResponse.redirect(new URL('/suspended', request.url))
    }
    if (tenant.status === 'cancelled') {
      return NextResponse.redirect(new URL('/pricing', request.url))
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
     * - public files (svg, png, jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

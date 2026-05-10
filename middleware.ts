import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                    request.nextUrl.pathname.startsWith('/signup') ||
                    request.nextUrl.pathname.startsWith('/forgot-password')

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/admin') ||
                          request.nextUrl.pathname.startsWith('/onboarding') ||
                          (request.nextUrl.pathname.startsWith('/api') && !request.nextUrl.pathname.startsWith('/api/webhooks'))

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // 1. Get user profile and tenant using service role to bypass RLS for auth check
    const supabase = await createClient(true)

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    // If authenticated but no public.users row exists yet → redirect to onboarding
    if (!profile || profileError) {
      if (!request.nextUrl.pathname.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
      return supabaseResponse
    }

    // 2. Get tenant status
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('status')
      .eq('id', profile.tenant_id)
      .single()

    if (!tenant || tenantError) {
      // Something is wrong with the tenant, logout might be safest or redirect to error
      return supabaseResponse
    }

    // 3. Handle tenant status redirects
    if (tenant.status === 'pending_admin_approval' && !request.nextUrl.pathname.startsWith('/pending-approval')) {
      return NextResponse.redirect(new URL('/pending-approval', request.url))
    }
    if (tenant.status === 'suspended' && !request.nextUrl.pathname.startsWith('/suspended')) {
      return NextResponse.redirect(new URL('/suspended', request.url))
    }
    if (tenant.status === 'cancelled' && !request.nextUrl.pathname.startsWith('/pricing')) {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }

    // 4. Role-based access for /admin
    if (request.nextUrl.pathname.startsWith('/admin') && profile.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 5. Redirect from auth pages to dashboard if already logged in and has profile
    if (isAuthPage) {
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

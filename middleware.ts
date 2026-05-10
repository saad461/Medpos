import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                    request.nextUrl.pathname.startsWith('/signup') ||
                    request.nextUrl.pathname.startsWith('/forgot-password')

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/admin') ||
                          (request.nextUrl.pathname.startsWith('/api') && !request.nextUrl.pathname.startsWith('/api/webhooks'))

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // TODO: Step 2 — add tenant status check from DB once tables are created
    // status = 'pending_admin_approval' → redirect to /pending-approval page
    // status = 'suspended' → redirect to /suspended page
    // status = 'cancelled' → redirect to /pricing

    if (request.nextUrl.pathname.startsWith('/admin')) {
      // TODO: Step 2 — Verify user role = 'super_admin' from DB
      // For now, we allow through but in Step 2 we will redirect to /dashboard if not super_admin
    }

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

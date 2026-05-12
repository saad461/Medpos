import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', req.url))
  }

  const supabase = await createClient()

  try {
    // Find invitation
    const { data: invitation, error } = await supabase
      .from('invitations')
      .select('*, tenants(name)')
      .eq('token', token)
      .single()

    if (error || !invitation) {
      return NextResponse.redirect(new URL('/login?error=invitation_not_found', req.url))
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.redirect(new URL('/login?error=invitation_expired', req.url))
    }

    // Check if already accepted
    if (invitation.accepted_at) {
      return NextResponse.redirect(new URL('/login?message=already_joined', req.url))
    }

    // Redirect to signup with pre-filled info
    const signupUrl = new URL('/signup', req.url)
    signupUrl.searchParams.set('invite_token', token)
    signupUrl.searchParams.set('email', invitation.email)
    signupUrl.searchParams.set('name', invitation.name)
    signupUrl.searchParams.set('role', invitation.role)
    signupUrl.searchParams.set('store_name', (invitation as any).tenants.name)

    return NextResponse.redirect(signupUrl)
  } catch (error) {
    console.error('[INVITE_ACCEPT_GET]', error)
    return NextResponse.redirect(new URL('/login?error=internal_error', req.url))
  }
}

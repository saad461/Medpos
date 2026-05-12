import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createAuditLog } from '@/lib/audit'

export async function POST(req: Request) {
  // Use service role to bypass RLS since we're creating the first user link
  const supabase = createClient(true)

  try {
    const { userId, token } = await req.json()

    if (!userId || !token) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // 1. Find invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError || !invitation) {
      return new NextResponse('Invitation not found', { status: 404 })
    }

    if (invitation.accepted_at) {
      return new NextResponse('Invitation already accepted', { status: 400 })
    }

    // 2. Create public.users record
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
    if (authError || !authUser.user) throw new Error('User not found in auth')

    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        tenant_id: invitation.tenant_id,
        email: invitation.email,
        name: authUser.user.user_metadata.name || invitation.name,
        role: invitation.role,
        is_active: true,
      })

    if (userError) throw userError

    // 3. Mark invitation as accepted
    await supabase
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id)

    // 4. Update auth user metadata (important for JWT claims)
    await supabase.auth.admin.updateUserById(userId, {
      app_metadata: {
        tenant_id: invitation.tenant_id,
        role: invitation.role,
      }
    })

    await createAuditLog({
      tenant_id: invitation.tenant_id,
      user_id: userId,
      action: 'ACCEPT_INVITATION',
      table_name: 'users',
      record_id: userId,
      new_value: { role: invitation.role },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ACCEPT_INVITE_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

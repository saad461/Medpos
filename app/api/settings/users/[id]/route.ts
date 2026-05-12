import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAuditLog } from '@/lib/audit'

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'pharmacist', 'cashier']),
})

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const userId = params.id

  try {
    const { data: { user: requester } } = await supabase.auth.getUser()
    if (!requester) return new NextResponse('Unauthorized', { status: 401 })

    const tenantId = requester.app_metadata.tenant_id
    const requesterRole = requester.app_metadata.role

    const body = await req.json()
    const { role: newRole } = updateRoleSchema.parse(body)

    // Fetch target user to check permissions
    const { data: targetUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('tenant_id', tenantId)
      .single()

    if (!targetUser) return new NextResponse('User not found', { status: 404 })

    // Permission check
    const canManage =
      requesterRole === 'owner' ||
      requesterRole === 'super_admin' ||
      (requesterRole === 'admin' && (targetUser.role === 'pharmacist' || targetUser.role === 'cashier'))

    if (!canManage) return new NextResponse('Forbidden', { status: 403 })

    // Update role
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) throw error

    await createAuditLog({
      tenant_id: tenantId,
      user_id: requester.id,
      action: 'CHANGE_USER_ROLE',
      table_name: 'users',
      record_id: userId,
      old_value: { role: targetUser.role },
      new_value: { role: newRole },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[USER_UPDATE_PUT]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const userId = params.id

  try {
    const { data: { user: requester } } = await supabase.auth.getUser()
    if (!requester) return new NextResponse('Unauthorized', { status: 401 })

    const tenantId = requester.app_metadata.tenant_id
    const requesterRole = requester.app_metadata.role

    if (requester.id === userId) return new NextResponse('Cannot remove yourself', { status: 400 })

    // Fetch target user
    const { data: targetUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('tenant_id', tenantId)
      .single()

    if (!targetUser) return new NextResponse('User not found', { status: 404 })
    if (targetUser.role === 'owner') return new NextResponse('Cannot remove owner', { status: 403 })

    // Permission check
    const canManage =
      requesterRole === 'owner' ||
      requesterRole === 'super_admin' ||
      (requesterRole === 'admin' && (targetUser.role === 'pharmacist' || targetUser.role === 'cashier'))

    if (!canManage) return new NextResponse('Forbidden', { status: 403 })

    // Soft delete / Deactivate
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', userId)

    if (error) throw error

    // In a real app with Supabase Admin SDK access, we would revoke sessions
    // For now, we set is_active=false which should be checked by middleware/RLS

    await createAuditLog({
      tenant_id: tenantId,
      user_id: requester.id,
      action: 'REMOVE_USER',
      table_name: 'users',
      record_id: userId,
      old_value: { is_active: true },
      new_value: { is_active: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[USER_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

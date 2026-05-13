import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
  const offset = parseInt(searchParams.get('offset') || '0')
  const unreadOnly = searchParams.get('unread_only') === 'true'
  const type = searchParams.get('type')

  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenantId = user.app_metadata.tenant_id

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenantId)
    .or(`user_id.eq.${user.id},user_id.is.null`)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  if (type && type !== 'all') {
    query = query.eq('type', type)
  }

  const { data: notifications, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get total unread count for the badge
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .eq('is_read', false)

  return NextResponse.json({
    notifications,
    unread_count: unreadCount || 0,
    total: count || 0,
  })
}

export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenantId = user.app_metadata.tenant_id

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('tenant_id', tenantId)
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .eq('is_read', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

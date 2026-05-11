import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')
  const userId = searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = await createClient(true)

    // Check if user has a profile and tenant (created by webhook)
    const { data: profile } = await adminSupabase
      .from('users')
      .select('tenant_id')
      .eq('id', userId)
      .single()

    if (profile?.tenant_id) {
      const { data: tenant } = await adminSupabase
        .from('tenants')
        .select('status')
        .eq('id', profile.tenant_id)
        .single()

      if (tenant) {
        return NextResponse.json({
          status: tenant.status === 'active' || tenant.status === 'pending_admin_approval' ? 'active' : 'pending',
          tenant_id: profile.tenant_id
        })
      }
    }

    // TODO: Actually verify with Safepay API if needed,
    // but usually checking our DB for webhook results is enough.

    return NextResponse.json({ status: 'pending' })
  } catch (error) {
    return NextResponse.json({ status: 'failed' })
  }
}

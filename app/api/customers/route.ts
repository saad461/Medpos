import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })
    const tenantId = user.app_metadata.tenant_id

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')
    const filter = searchParams.get('filter')

    let query = supabase
      .from('customers')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)

    if (q) {
      query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,cnic.ilike.%${q}%`)
    }

    if (filter === 'credit') {
      query = query.gt('credit_balance', 0)
    }

    const { data: customers, error } = await query.order('name', { ascending: true })
    if (error) throw error

    return NextResponse.json(customers)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

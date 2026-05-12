import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const role = user.app_metadata.role
    if (['cashier'].includes(role)) {
       return new NextResponse('Forbidden: Cashiers cannot access supplier module', { status: 403 })
    }

    const tenantId = user.app_metadata.tenant_id

    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return NextResponse.json(suppliers)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

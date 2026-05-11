import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCustomerSummary } from '@/lib/reports/queries'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })
    const tenantId = user.app_metadata.tenant_id

    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const range = {
      from: from ? new Date(from) : new Date(),
      to: to ? new Date(to) : new Date(),
    }

    const [summary, topCustomers] = await Promise.all([
      getCustomerSummary(tenantId, range),
      supabase.from('customers').select('*').eq('tenant_id', tenantId).order('total_spent', { ascending: false }).limit(10)
    ])

    return NextResponse.json({
      summary,
      topCustomers: topCustomers.data
    })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

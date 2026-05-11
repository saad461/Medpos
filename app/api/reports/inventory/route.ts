import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getInventoryValuation,
  getExpiryReport,
  getLowStockReport
} from '@/lib/reports/queries'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })
    const tenantId = user.app_metadata.tenant_id

    const [valuation, expiringSoon, lowStock] = await Promise.all([
      getInventoryValuation(tenantId),
      getExpiryReport(tenantId, 30),
      getLowStockReport(tenantId)
    ])

    return NextResponse.json({
      valuation,
      expiringSoon,
      lowStock
    })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

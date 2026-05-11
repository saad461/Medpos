import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProfitLoss, getSalesByDay } from '@/lib/reports/queries'

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

    const [pl, dailyData] = await Promise.all([
      getProfitLoss(tenantId, range),
      getSalesByDay(tenantId, range)
    ])

    return NextResponse.json({
      summary: pl,
      trend: dailyData.map(d => ({
        date: d.date,
        revenue: Number(d.revenue),
        profit: Number(d.revenue) * (pl.margin / 100)
      }))
    })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

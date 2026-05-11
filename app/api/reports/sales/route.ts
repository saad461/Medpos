import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getSalesSummary,
  getSalesByDay,
  getSalesByWeek,
  getSalesByMonth,
  getTopMedicines,
  getTopCategories,
  getPaymentMethodBreakdown,
  getTaxReport
} from '@/lib/reports/queries'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })
    const tenantId = user.app_metadata.tenant_id

    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const view = (searchParams.get('view') || 'daily') as 'daily' | 'weekly' | 'monthly'

    const range = {
      from: from ? new Date(from) : new Date(),
      to: to ? new Date(to) : new Date(),
    }

    const [summary, chartDaily, chartWeekly, chartMonthly, topMeds, categories, payments, allSales] = await Promise.all([
      getSalesSummary(tenantId, range),
      getSalesByDay(tenantId, range),
      getSalesByWeek(tenantId, range),
      getSalesByMonth(tenantId, range),
      getTopMedicines(tenantId, range),
      getTopCategories(tenantId, range),
      getPaymentMethodBreakdown(tenantId, range),
      getTaxReport(tenantId, range)
    ])

    return NextResponse.json({
      summary,
      charts: { daily: chartDaily, weekly: chartWeekly, monthly: chartMonthly },
      topMeds,
      categories,
      payments,
      allSales
    })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

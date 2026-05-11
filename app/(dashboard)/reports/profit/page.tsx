import { Suspense } from 'react'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  LayoutDashboard
} from 'lucide-react'
import Link from 'next/link'
import { DateRangePicker } from '@/components/reports/date-range-picker'
import { ReportCard } from '@/components/reports/report-card'
import { ProfitChart } from '@/components/reports/profit-chart'
import { ReportTable } from '@/components/reports/report-table'
import { ExportButton } from '@/components/reports/export-button'
import {
  getProfitLoss,
  getSalesByDay,
} from '@/lib/reports/queries'
import { getDateRangeFromParams } from '@/lib/reports/date-utils'
import { createClient } from '@/lib/supabase/server'
import { formatPKR } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default async function ProfitReportPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string }
}) {
  const range = getDateRangeFromParams(searchParams.from, searchParams.to)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tenantId = user?.app_metadata?.tenant_id

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Profit & Loss</h1>
          <p className="text-muted-foreground mt-1">
            Analyze your revenue, costs, and net profit.
          </p>
        </div>
        <ExportButton reportType="profit" dateRange={range} />
      </div>

      <DateRangePicker value={range} />

      <Suspense fallback={<StatsSkeleton />}>
        <ProfitContent tenantId={tenantId} range={range} />
      </Suspense>
    </div>
  )
}

async function ProfitContent({ tenantId, range }: { tenantId: string, range: any }) {
  const [pl, dailyData] = await Promise.all([
    getProfitLoss(tenantId, range),
    getSalesByDay(tenantId, range)
  ])

  // Mocking profit trend for now as we'd need a more complex RPC to get daily COGS
  const trendData = dailyData.map(d => ({
    date: d.date,
    revenue: Number(d.revenue),
    profit: Number(d.revenue) * (pl.margin / 100)
  }))

  return (
    <div className="space-y-8">
      {pl.missingPrices.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Profit calculation may be incomplete</AlertTitle>
          <AlertDescription>
            <p className="mb-2">{pl.missingPrices.length} medicines are missing purchase price data.</p>
            <div className="max-h-24 overflow-y-auto mb-3 text-xs opacity-80">
              {pl.missingPrices.join(', ')}
            </div>
            <Link href="/inventory" className="text-sm font-bold underline">
              Update prices in Inventory →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Gross Revenue"
          value={pl.revenue}
          format="currency"
          icon={TrendingUp}
          iconColor="text-emerald-500"
        />
        <ReportCard
          title="Cost of Goods Sold"
          value={pl.cogs}
          format="currency"
          icon={TrendingDown}
          iconColor="text-red-500"
        />
        <ReportCard
          title="Gross Profit"
          value={pl.profit}
          format="currency"
          subtitle={`Margin: ${pl.margin.toFixed(1)}%`}
          icon={BarChart3}
          iconColor="text-primary"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-6">Profit Trend</h3>
        <ProfitChart data={trendData} />
      </div>
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <ReportCard key={i} title="" value="" icon={LayoutDashboard} loading />
      ))}
    </div>
  )
}

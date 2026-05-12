export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import {
  Users,
  TrendingUp,
  Clock,
  LayoutDashboard
} from 'lucide-react'
import { DateRangePicker } from '@/components/reports/date-range-picker'
import { ReportCard } from '@/components/reports/report-card'
import { ReportTable } from '@/components/reports/report-table'
import { HourlyHeatmap } from '@/components/reports/hourly-heatmap'
import { ExportButton } from '@/components/reports/export-button'
import {
  getCashierPerformance,
  getHourlyHeatmap
} from '@/lib/reports/queries'
import { getDateRangeFromParams } from '@/lib/reports/date-utils'
import { createClient } from '@/lib/supabase/server'
import { formatPKR } from '@/lib/utils'

export default async function ShiftReportPage({
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
          <h1 className="text-3xl font-bold text-primary">Shift Report</h1>
          <p className="text-muted-foreground mt-1">
            Analyze sales performance by cashier and time of day.
          </p>
        </div>
        <ExportButton reportType="shift" dateRange={range} />
      </div>

      <DateRangePicker value={range} />

      <Suspense fallback={<StatsSkeleton />}>
        <ShiftContent tenantId={tenantId} range={range} />
      </Suspense>
    </div>
  )
}

async function ShiftContent({ tenantId, range }: { tenantId: string, range: any }) {
  const [cashiers, heatmap] = await Promise.all([
    getCashierPerformance(tenantId, range),
    getHourlyHeatmap(tenantId, range)
  ])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard
          title="Total Cashiers"
          value={cashiers.length}
          format="number"
          icon={Users}
          iconColor="text-blue-500"
        />
        <ReportCard
          title="Top Performance"
          value={cashiers.length > 0 ? cashiers.reduce((max, c) => c.revenue > max.revenue ? c : max, cashiers[0]).name : 'N/A'}
          subtitle={cashiers.length > 0 ? `Highest Revenue` : ''}
          icon={TrendingUp}
          iconColor="text-emerald-500"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-6">Cashier Performance</h3>
        <ReportTable
          columns={[
            {
              accessorKey: 'name',
              header: 'Cashier Name',
              cell: ({ row }) => <span className="font-bold">{row.getValue('name')}</span>
            },
            {
              accessorKey: 'count',
              header: 'Total Sales',
            },
            {
              accessorKey: 'revenue',
              header: 'Total Revenue',
              cell: ({ row }) => <span className="font-bold text-primary">{formatPKR(row.getValue('revenue'))}</span>
            },
            {
              accessorKey: 'returns',
              header: 'Returns',
              cell: ({ row }) => <span className="text-red-500">{formatPKR(row.getValue('returns'))}</span>
            }
          ]}
          data={cashiers}
        />
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-primary">Hourly Sales Heatmap</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Pakistan Standard Time (UTC+5)</span>
          </div>
        </div>
        <HourlyHeatmap data={heatmap} />
      </div>
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <ReportCard key={i} title="" value="" icon={LayoutDashboard} loading />
      ))}
    </div>
  )
}

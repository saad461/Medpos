import { Suspense } from 'react'
import {
  Users,
  UserPlus,
  CreditCard,
  LayoutDashboard
} from 'lucide-react'
import { DateRangePicker } from '@/components/reports/date-range-picker'
import { ReportCard } from '@/components/reports/report-card'
import { ReportTable } from '@/components/reports/report-table'
import { ExportButton } from '@/components/reports/export-button'
import {
  getCustomerSummary,
} from '@/lib/reports/queries'
import { getDateRangeFromParams } from '@/lib/reports/date-utils'
import { createClient } from '@/lib/supabase/server'
import { formatPKR } from '@/lib/utils'

export default async function CustomerReportPage({
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
          <h1 className="text-3xl font-bold text-primary">Customer Report</h1>
          <p className="text-muted-foreground mt-1">
            Customer growth and credit analytics.
          </p>
        </div>
        <ExportButton reportType="customers" dateRange={range} />
      </div>

      <DateRangePicker value={range} />

      <Suspense fallback={<StatsSkeleton />}>
        <CustomerContent tenantId={tenantId} range={range} />
      </Suspense>
    </div>
  )
}

async function CustomerContent({ tenantId, range }: { tenantId: string, range: any }) {
  const summary = await getCustomerSummary(tenantId, range)
  const supabase = await createClient()

  const { data: topCustomers } = await supabase
    .from('customers')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('total_spent', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Total Customers"
          value={summary.totalCustomers}
          format="number"
          icon={Users}
          iconColor="text-blue-500"
        />
        <ReportCard
          title="Active in Period"
          value={summary.activeCustomers}
          format="number"
          icon={UserPlus}
          iconColor="text-emerald-500"
        />
        <ReportCard
          title="Outstanding Credit"
          value={summary.totalCredit}
          format="currency"
          icon={CreditCard}
          iconColor="text-red-500"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-6">Top Customers</h3>
        <ReportTable
          columns={[
            {
              accessorKey: 'name',
              header: 'Customer Name',
              cell: ({ row }) => <span className="font-bold">{row.getValue('name')}</span>
            },
            {
              accessorKey: 'phone',
              header: 'Phone',
            },
            {
              accessorKey: 'total_spent',
              header: 'Total Spent',
              cell: ({ row }) => <span className="font-bold text-primary">{formatPKR(row.getValue('total_spent'))}</span>
            },
            {
              accessorKey: 'credit_balance',
              header: 'Credit Balance',
              cell: ({ row }) => (
                <span className={Number(row.getValue('credit_balance')) > 0 ? 'text-red-500 font-bold' : ''}>
                  {formatPKR(row.getValue('credit_balance'))}
                </span>
              )
            }
          ]}
          data={topCustomers || []}
        />
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

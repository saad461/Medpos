import { Suspense } from 'react'
import {
  Truck,
  PackageCheck,
  CreditCard,
  LayoutDashboard
} from 'lucide-react'
import { DateRangePicker } from '@/components/reports/date-range-picker'
import { ReportCard } from '@/components/reports/report-card'
import { ReportTable } from '@/components/reports/report-table'
import { ExportButton } from '@/components/reports/export-button'
import { createClient } from '@/lib/supabase/server'
import { formatPKR } from '@/lib/utils'
import { getDateRangeFromParams, formatPKDate } from '@/lib/reports/date-utils'

export default async function SupplierReportPage({
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
          <h1 className="text-3xl font-bold text-primary">Supplier Report</h1>
          <p className="text-muted-foreground mt-1">
            Supplier performance and purchase history.
          </p>
        </div>
        <ExportButton reportType="suppliers" dateRange={range} />
      </div>

      <DateRangePicker value={range} />

      <Suspense fallback={<StatsSkeleton />}>
        <SupplierContent tenantId={tenantId} range={range} />
      </Suspense>
    </div>
  )
}

async function SupplierContent({ tenantId, range }: { tenantId: string, range: any }) {
  const supabase = await createClient()

  const [suppliers, pos] = await Promise.all([
    supabase.from('suppliers').select('*').eq('tenant_id', tenantId),
    supabase.from('purchase_orders')
      .select('*, suppliers(name)')
      .eq('tenant_id', tenantId)
      .gte('created_at', range.from.toISOString())
      .lte('created_at', range.to.toISOString())
  ])

  const totalBalanceDue = suppliers.data?.reduce((sum, s) => sum + Number(s.balance_due), 0) || 0
  const totalPurchases = pos.data?.reduce((sum, p) => sum + Number(p.total_amount), 0) || 0

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Total Suppliers"
          value={suppliers.data?.length || 0}
          format="number"
          icon={Truck}
          iconColor="text-blue-500"
        />
        <ReportCard
          title="Total Purchases"
          value={totalPurchases}
          format="currency"
          icon={PackageCheck}
          iconColor="text-emerald-500"
        />
        <ReportCard
          title="Balance Due"
          value={totalBalanceDue}
          format="currency"
          icon={CreditCard}
          iconColor="text-red-500"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-6">Recent Purchase Orders</h3>
        <ReportTable
          columns={[
            {
              accessorKey: 'created_at',
              header: 'Date',
              cell: ({ row }) => formatPKDate(row.getValue('created_at'))
            },
            {
              accessorKey: 'suppliers.name',
              header: 'Supplier',
              cell: ({ row }) => <span className="font-bold">{(row.original as any).suppliers?.name || 'Unknown'}</span>
            },
            {
              accessorKey: 'invoice_no',
              header: 'Invoice No',
            },
            {
              accessorKey: 'total_amount',
              header: 'Amount',
              cell: ({ row }) => <span className="font-bold text-primary">{formatPKR(row.getValue('total_amount'))}</span>
            },
            {
              accessorKey: 'status',
              header: 'Status',
              cell: ({ row }) => <span className="uppercase text-xs font-bold">{row.getValue('status')}</span>
            }
          ]}
          data={pos.data || []}
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

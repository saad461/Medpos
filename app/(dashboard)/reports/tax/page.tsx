export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import {
  Receipt,
  FileText,
  PieChart,
  LayoutDashboard
} from 'lucide-react'
import { DateRangePicker } from '@/components/reports/date-range-picker'
import { ReportCard } from '@/components/reports/report-card'
import { ReportTable } from '@/components/reports/report-table'
import { ExportButton } from '@/components/reports/export-button'
import {
  getSalesSummary,
  getTaxReport
} from '@/lib/reports/queries'
import { getDateRangeFromParams, formatPKDate } from '@/lib/reports/date-utils'
import { createClient } from '@/lib/supabase/server'
import { formatPKR } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default async function TaxReportPage({
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
          <h1 className="text-3xl font-bold text-primary">GST / Tax Report</h1>
          <p className="text-muted-foreground mt-1">
            Tax collected for FBR compliance and record-keeping.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FBRExportButton range={range} />
          <ExportButton reportType="tax" dateRange={range} />
        </div>
      </div>

      <DateRangePicker value={range} />

      <Suspense fallback={<StatsSkeleton />}>
        <TaxContent tenantId={tenantId} range={range} />
      </Suspense>
    </div>
  )
}

async function FBRExportButton({ range }: { range: any }) {
  return (
    <Link
      href={`/api/reports/export?type=fbr&from=${range.from.toISOString()}&to=${range.to.toISOString()}&format=pdf`}
      target="_blank"
    >
      <Button variant="default" size="sm" className="bg-primary text-white">
        <FileText className="mr-2 h-4 w-4" />
        Export for FBR (PDF)
      </Button>
    </Link>
  )
}

async function TaxContent({ tenantId, range }: { tenantId: string, range: any }) {
  const [summary, taxData] = await Promise.all([
    getSalesSummary(tenantId, range),
    getTaxReport(tenantId, range)
  ])

  const preTaxAmount = summary.revenue - summary.totalTax

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Total Sales (Pre-Tax)"
          value={preTaxAmount}
          format="currency"
          icon={Receipt}
          iconColor="text-blue-500"
        />
        <ReportCard
          title="Total GST Collected"
          value={summary.totalTax}
          format="currency"
          icon={PieChart}
          iconColor="text-amber-500"
        />
        <ReportCard
          title="Net Sales (Post-Tax)"
          value={summary.revenue}
          format="currency"
          icon={FileText}
          iconColor="text-emerald-500"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-6">Tax Breakdown Table</h3>
        <ReportTable
          columns={[
            {
              accessorKey: 'created_at',
              header: 'Date',
              cell: ({ row }) => formatPKDate(row.getValue('created_at'))
            },
            {
              accessorKey: 'invoice_no',
              header: 'Invoice No',
            },
            {
              accessorKey: 'subtotal',
              header: 'Pre-Tax Amount',
              cell: ({ row }) => formatPKR(Number(row.getValue('subtotal')) - Number(row.original.discount))
            },
            {
              accessorKey: 'tax',
              header: 'Tax Amount',
              cell: ({ row }) => formatPKR(row.getValue('tax'))
            },
            {
              accessorKey: 'total',
              header: 'Total',
              cell: ({ row }) => <span className="font-bold">{formatPKR(row.getValue('total'))}</span>
            }
          ]}
          data={taxData}
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

export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import {
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Package,
  Calendar as CalendarIcon,
  CreditCard,
  Banknote,
  LayoutDashboard
} from 'lucide-react'
import { DateRangePicker } from '@/components/reports/date-range-picker'
import { ReportCard } from '@/components/reports/report-card'
import { SalesChart } from '@/components/reports/sales-chart'
import { PaymentMethodChart } from '@/components/reports/payment-method-chart'
import { CategoryChart } from '@/components/reports/category-chart'
import { TopMedicinesChart } from '@/components/reports/top-medicines-chart'
import { ReportTable } from '@/components/reports/report-table'
import { ExportButton } from '@/components/reports/export-button'
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
import { getDateRangeFromParams, formatPKDate, formatPKDateTime } from '@/lib/reports/date-utils'
import { createClient } from '@/lib/supabase/server'
import { formatPKR } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; view?: string }
}) {
  const range = getDateRangeFromParams(searchParams.from, searchParams.to)
  const view = (searchParams.view || 'daily') as 'daily' | 'weekly' | 'monthly'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tenantId = user?.app_metadata?.tenant_id

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Sales Report</h1>
          <p className="text-muted-foreground mt-1">
            Detailed breakdown of your pharmacy's sales performance.
          </p>
        </div>
        <ExportButton reportType="sales" dateRange={range} />
      </div>

      <DateRangePicker value={range} />

      <Suspense fallback={<StatsSkeleton />}>
        <SalesContent tenantId={tenantId} range={range} view={view} />
      </Suspense>
    </div>
  )
}

async function SalesContent({ tenantId, range, view }: { tenantId: string, range: any, view: 'daily' | 'weekly' | 'monthly' }) {
  const [summary, chartDataDaily, chartDataWeekly, chartDataMonthly, topMeds, categories, payments, allSales] = await Promise.all([
    getSalesSummary(tenantId, range),
    getSalesByDay(tenantId, range),
    getSalesByWeek(tenantId, range),
    getSalesByMonth(tenantId, range),
    getTopMedicines(tenantId, range, 10),
    getTopCategories(tenantId, range),
    getPaymentMethodBreakdown(tenantId, range),
    getTaxReport(tenantId, range)
  ])

  const chartData = view === 'daily' ? chartDataDaily : view === 'weekly' ? chartDataWeekly : chartDataMonthly

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard
          title="Total Revenue"
          value={summary.revenue}
          format="currency"
          icon={TrendingUp}
          iconColor="text-emerald-500"
          trend={{
            value: summary.revenueTrend,
            label: 'vs prev period',
            direction: summary.revenueTrend >= 0 ? 'up' : 'down'
          }}
        />
        <ReportCard
          title="Sales Count"
          value={summary.count}
          format="number"
          icon={ShoppingCart}
          iconColor="text-blue-500"
          trend={{
            value: summary.countTrend,
            label: 'vs prev period',
            direction: summary.countTrend >= 0 ? 'up' : 'down'
          }}
        />
        <ReportCard
          title="Avg Sale"
          value={summary.avgSale}
          format="currency"
          icon={BarChart3}
          iconColor="text-indigo-500"
        />
        <ReportCard
          title="Total Items"
          value={topMeds.reduce((sum, m) => sum + m.qty, 0)}
          format="number"
          icon={Package}
          iconColor="text-amber-500"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-primary">Sales Trend</h3>
          <Tabs defaultValue={view}>
            <TabsList>
              <Link href={`?from=${range.from.toISOString()}&to=${range.to.toISOString()}&view=daily`} passHref>
                <TabsTrigger value="daily">Daily</TabsTrigger>
              </Link>
              <Link href={`?from=${range.from.toISOString()}&to=${range.to.toISOString()}&view=weekly`} passHref>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
              </Link>
              <Link href={`?from=${range.from.toISOString()}&to=${range.to.toISOString()}&view=monthly`} passHref>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>
        </div>
        <SalesChart data={chartData} view={view} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold text-primary mb-6">Payment Methods</h3>
          <PaymentMethodChart cash={payments.cash} card={payments.card} credit={payments.credit} />
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold text-primary mb-6">Sales by Category</h3>
          <CategoryChart data={categories} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-6">Top Selling Medicines</h3>
        <TopMedicinesChart data={topMeds} />
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-6">All Sales</h3>
        <ReportTable
          columns={[
            {
              accessorKey: 'invoice_no',
              header: 'Invoice No',
              cell: ({ row }) => <span className="font-mono font-bold text-primary">{row.getValue('invoice_no')}</span>
            },
            {
              accessorKey: 'created_at',
              header: 'Date & Time',
              cell: ({ row }) => formatPKDateTime(row.getValue('created_at'))
            },
            {
              accessorKey: 'total',
              header: 'Total',
              cell: ({ row }) => <span className="font-bold">{formatPKR(row.getValue('total'))}</span>
            }
          ]}
          data={allSales}
          searchable
          searchPlaceholder="Search invoices..."
        />
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

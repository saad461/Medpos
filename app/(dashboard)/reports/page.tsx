import { Suspense } from 'react'
import {
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Package,
  ArrowRight,
  Receipt,
  Users,
  Truck,
  History,
  Clock,
  LayoutDashboard
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ReportCard } from '@/components/reports/report-card'
import { getSalesSummary, getTopMedicines } from '@/lib/reports/queries'
import { getDateRangeFromParams } from '@/lib/reports/date-utils'
import { createClient } from '@/lib/supabase/server'
import { formatPKR, cn } from '@/lib/utils'

export default async function ReportsPage({
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
      <div>
        <h1 className="text-3xl font-bold text-primary">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive business analytics and performance tracking.
        </p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <ReportOverview tenantId={tenantId} range={range} />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NavigationCard
          href="/reports/sales"
          title="Sales Report"
          description="Daily, weekly, monthly sales with charts"
          icon={TrendingUp}
          color="text-emerald-500"
        />
        <NavigationCard
          href="/reports/profit"
          title="Profit & Loss"
          description="Revenue, COGS, and net profit breakdown"
          icon={BarChart3}
          color="text-blue-500"
        />
        <NavigationCard
          href="/reports/inventory"
          title="Inventory Report"
          description="Stock levels, expiry, and valuation"
          icon={Package}
          color="text-amber-500"
        />
        <NavigationCard
          href="/reports/customers"
          title="Customer Report"
          description="Top customers, purchase history, credit"
          icon={Users}
          color="text-indigo-500"
        />
        <NavigationCard
          href="/reports/suppliers"
          title="Supplier Report"
          description="Purchase orders and supplier performance"
          icon={Truck}
          color="text-purple-500"
        />
        <NavigationCard
          href="/reports/tax"
          title="GST / Tax Report"
          description="Tax collected for FBR compliance"
          icon={Receipt}
          color="text-red-500"
        />
        <NavigationCard
          href="/reports/shift"
          title="Shift Report"
          description="Sales by cashier and shift"
          icon={Clock}
          color="text-cyan-500"
        />
        <NavigationCard
          href="/reports/audit"
          title="Audit Log"
          description="Complete history of all system changes"
          icon={History}
          color="text-slate-500"
        />
      </div>
    </div>
  )
}

async function ReportOverview({ tenantId, range }: { tenantId: string, range: any }) {
  const [summary, topMeds] = await Promise.all([
    getSalesSummary(tenantId, range),
    getTopMedicines(tenantId, range, 1)
  ])

  const topMed = topMeds[0]

  return (
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
        title="Total Sales"
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
        title="Avg Sale Value"
        value={summary.avgSale}
        format="currency"
        icon={BarChart3}
        iconColor="text-indigo-500"
      />
      <ReportCard
        title="Top Medicine"
        value={topMed?.name || 'N/A'}
        subtitle={topMed ? `${topMed.qty} units sold` : 'No sales in period'}
        icon={Package}
        iconColor="text-amber-500"
      />
    </div>
  )
}

function NavigationCard({ href, title, description, icon: Icon, color }: any) {
  return (
    <Link href={href}>
      <Card className="hover:border-primary transition-colors group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn('p-3 rounded-xl bg-opacity-10', color.replace('text-', 'bg-'))}>
              <Icon className={cn('h-6 w-6', color)} />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-primary mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
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

export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import {
  Package,
  RefreshCcw,
  LayoutDashboard,
  AlertCircle
} from 'lucide-react'
import { ReportCard } from '@/components/reports/report-card'
import { ReportTable } from '@/components/reports/report-table'
import { ExportButton } from '@/components/reports/export-button'
import {
  getInventoryValuation,
  getExpiryReport,
  getLowStockReport
} from '@/lib/reports/queries'
import { createClient } from '@/lib/supabase/server'
import { formatPKR } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { RefreshButton } from '@/components/reports/refresh-button'

export default async function InventoryReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tenantId = user?.app_metadata?.tenant_id

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Inventory Report</h1>
          <p className="text-muted-foreground mt-1">
            Current stock levels, valuation, and expiry tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <ExportButton reportType="inventory" dateRange={{ from: new Date(), to: new Date() }} />
        </div>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <InventoryContent tenantId={tenantId} />
      </Suspense>
    </div>
  )
}

async function InventoryContent({ tenantId }: { tenantId: string }) {
  const [valuation, expiringSoon, lowStock] = await Promise.all([
    getInventoryValuation(tenantId),
    getExpiryReport(tenantId, 30),
    getLowStockReport(tenantId)
  ])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard
          title="Total Medicines"
          value={valuation.totalItems}
          format="number"
          icon={Package}
          iconColor="text-blue-500"
        />
        <ReportCard
          title="Stock Value (Cost)"
          value={valuation.stockValue}
          format="currency"
          icon={AlertCircle}
          iconColor="text-amber-500"
        />
        <ReportCard
          title="Retail Value"
          value={valuation.retailValue}
          format="currency"
          icon={Package}
          iconColor="text-emerald-500"
        />
        <ReportCard
          title="Potential Profit"
          value={valuation.potentialProfit}
          format="currency"
          icon={RefreshCcw}
          iconColor="text-primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary">Expiring Soon (30 Days)</h3>
            <Badge variant="destructive">{expiringSoon.length} Items</Badge>
          </div>
          <ReportTable
            columns={[
              {
                accessorKey: 'medicines.name',
                header: 'Medicine',
                cell: ({ row }) => <span className="font-bold">{(row.original as any).medicines.name}</span>
              },
              {
                accessorKey: 'expiry_date',
                header: 'Expiry',
                cell: ({ row }) => <span className="text-red-500 font-medium">{row.getValue('expiry_date')}</span>
              },
              {
                accessorKey: 'stock_qty',
                header: 'Qty',
              }
            ]}
            data={expiringSoon}
            pagination={false}
            pageSize={5}
          />
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary">Low Stock Alerts</h3>
            <Badge variant="warning" className="bg-amber-500 hover:bg-amber-600">{lowStock.length} Items</Badge>
          </div>
          <ReportTable
            columns={[
              {
                accessorKey: 'medicines.name',
                header: 'Medicine',
                cell: ({ row }) => <span className="font-bold">{(row.original as any).medicines.name}</span>
              },
              {
                accessorKey: 'stock_qty',
                header: 'Current',
              },
              {
                accessorKey: 'reorder_level',
                header: 'Reorder Level',
              }
            ]}
            data={lowStock}
            pagination={false}
            pageSize={5}
          />
        </div>
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

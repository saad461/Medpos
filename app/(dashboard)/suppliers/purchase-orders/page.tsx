import { createClient } from '@/lib/supabase/server'
import { Plus, ShoppingBag, Truck, PackageCheck, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ReportCard } from '@/components/reports/report-card'
import { ReportTable } from '@/components/reports/report-table'
import { formatPKR } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { formatPKDate } from '@/lib/reports/date-utils'
import { Suspense } from 'react'

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: { supplier?: string; status?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tenantId = user?.app_metadata?.tenant_id

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage orders to your suppliers.
          </p>
        </div>
        <Link href="/suppliers/purchase-orders/new">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Purchase Order
          </Button>
        </Link>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <POStats tenantId={tenantId} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <POTableList tenantId={tenantId} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function POStats({ tenantId }: { tenantId: string }) {
  const supabase = await createClient()

  const { data: pos } = await supabase
    .from('purchase_orders')
    .select('status, total_amount')
    .eq('tenant_id', tenantId)

  const openOrders = pos?.filter(p => ['draft', 'sent', 'partial'].includes(p.status)) || []
  const receivedThisMonth = pos?.filter(p => p.status === 'received') || [] // Simplified month check

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ReportCard
        title="Open Orders"
        value={openOrders.length}
        format="number"
        icon={ShoppingBag}
        iconColor="text-blue-500"
      />
      <ReportCard
        title="Open Value"
        value={openOrders.reduce((sum, p) => sum + Number(p.total_amount), 0)}
        format="currency"
        icon={Truck}
        iconColor="text-amber-500"
      />
      <ReportCard
        title="Recently Received"
        value={receivedThisMonth.length}
        format="number"
        icon={PackageCheck}
        iconColor="text-emerald-500"
      />
    </div>
  )
}

async function POTableList({ tenantId, searchParams }: { tenantId: string, searchParams: any }) {
  const supabase = await createClient()

  let query = supabase
    .from('purchase_orders')
    .select('*, suppliers(name)')
    .eq('tenant_id', tenantId)

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  const { data: pos } = await query.order('created_at', { ascending: false })

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <ReportTable
        columns={[
          {
            accessorKey: 'po_number',
            header: 'PO #',
            cell: ({ row }) => <span className="font-mono font-bold text-primary">{row.getValue('po_number') || 'DRAFT'}</span>
          },
          {
            accessorKey: 'created_at',
            header: 'Date',
            cell: ({ row }) => formatPKDate(row.getValue('created_at'))
          },
          {
            accessorKey: 'suppliers.name',
            header: 'Supplier',
            cell: ({ row }) => <span className="font-bold">{(row.original as any).suppliers?.name}</span>
          },
          {
            accessorKey: 'total_amount',
            header: 'Total',
            cell: ({ row }) => <span className="font-bold">{formatPKR(row.getValue('total_amount'))}</span>
          },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
              const status = row.getValue('status') as string
              return (
                <Badge className={
                  status === 'draft' ? 'bg-slate-100 text-slate-700' :
                  status === 'sent' ? 'bg-blue-100 text-blue-700' :
                  status === 'received' ? 'bg-emerald-100 text-emerald-700' :
                  status === 'partial' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }>
                  {status.toUpperCase()}
                </Badge>
              )
            }
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <Link href={`/suppliers/purchase-orders/${row.original.id}`}>
                <Button variant="ghost" size="sm">View</Button>
              </Link>
            )
          }
        ]}
        data={pos || []}
        searchable
        searchPlaceholder="Search POs..."
      />
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />)}
    </div>
  )
}

function TableSkeleton() {
  return <div className="h-96 bg-slate-50 animate-pulse rounded-xl" />
}

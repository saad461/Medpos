export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import { Plus, Truck, PackageCheck, CreditCard, ShoppingBag, MapPin, Phone, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ReportCard } from '@/components/reports/report-card'
import { ReportTable } from '@/components/reports/report-table'
import { formatPKR } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { subDays } from 'date-fns'

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: { q?: string; filter?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tenantId = user?.app_metadata?.tenant_id

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Suppliers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your distributor relationships and track purchase history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/suppliers/purchase-orders/new">
            <Button variant="outline" size="sm">
              <ShoppingBag className="mr-2 h-4 w-4" />
              New Purchase Order
            </Button>
          </Link>
          <Link href="/suppliers/add">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <SupplierStats tenantId={tenantId} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <SupplierTableList tenantId={tenantId} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function SupplierStats({ tenantId }: { tenantId: string }) {
  const supabase = await createClient()

  const { count: totalSuppliers } = await supabase
    .from('suppliers')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('is_active', true)

  const ninetyDaysAgo = subDays(new Date(), 90).toISOString()
  const { count: activeSuppliers } = await supabase
    .from('purchase_orders')
    .select('supplier_id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('created_at', ninetyDaysAgo)

  const { data: balanceData } = await supabase
    .from('suppliers')
    .select('balance_due')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)

  const totalBalance = balanceData?.reduce((sum, s) => sum + Number(s.balance_due), 0) || 0

  const { data: purchaseData } = await supabase
    .from('purchase_orders')
    .select('total_amount')
    .eq('tenant_id', tenantId)

  const totalPurchased = purchaseData?.reduce((sum, p) => sum + Number(p.total_amount), 0) || 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <ReportCard
        title="Total Suppliers"
        value={totalSuppliers || 0}
        format="number"
        icon={Truck}
        iconColor="text-blue-500"
      />
      <ReportCard
        title="Active (90d)"
        value={activeSuppliers || 0}
        format="number"
        icon={PackageCheck}
        iconColor="text-emerald-500"
      />
      <ReportCard
        title="Total Balance Due"
        value={totalBalance}
        format="currency"
        icon={CreditCard}
        iconColor="text-amber-500"
      />
      <ReportCard
        title="Total Purchased"
        value={totalPurchased}
        format="currency"
        icon={ShoppingBag}
        iconColor="text-indigo-500"
      />
    </div>
  )
}

async function SupplierTableList({ tenantId, searchParams }: { tenantId: string, searchParams: any }) {
  const supabase = await createClient()

  let query = supabase
    .from('suppliers')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)

  if (searchParams.q) {
    query = query.or(`name.ilike.%${searchParams.q}%,phone.ilike.%${searchParams.q}%,city.ilike.%${searchParams.q}%`)
  }

  const { data: suppliers } = await query.order('name', { ascending: true })

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <ReportTable
        columns={[
          {
            accessorKey: 'name',
            header: 'Supplier Name',
            cell: ({ row }) => (
              <div className="flex flex-col">
                <span className="font-bold">{row.getValue('name')}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {row.original.city || 'N/A'}
                </span>
              </div>
            )
          },
          {
            accessorKey: 'phone',
            header: 'Contact',
            cell: ({ row }) => (
              <div className="flex flex-col text-xs gap-1">
                <span className="flex items-center gap-1 font-medium"><Phone className="h-3 w-3" /> {row.getValue('phone')}</span>
                {row.original.email && <span className="flex items-center gap-1 opacity-70"><Mail className="h-3 w-3" /> {row.original.email}</span>}
              </div>
            )
          },
          {
            accessorKey: 'ntn',
            header: 'NTN',
            cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.getValue('ntn') || 'N/A'}</span>
          },
          {
            accessorKey: 'balance_due',
            header: 'Balance Due',
            cell: ({ row }) => {
              const balance = Number(row.getValue('balance_due'))
              return (
                <span className={balance > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {formatPKR(balance)}
                </span>
              )
            }
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <div className="flex items-center gap-2">
                <Link href={`/suppliers/${row.original.id}`}>
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
                <Link href={`/suppliers/purchase-orders/new?supplier=${row.original.id}`}>
                  <Button variant="ghost" size="sm">New PO</Button>
                </Link>
              </div>
            )
          }
        ]}
        data={suppliers || []}
        searchable
        searchPlaceholder="Search suppliers..."
      />
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />)}
    </div>
  )
}

function TableSkeleton() {
  return <div className="h-96 bg-slate-50 animate-pulse rounded-xl" />
}

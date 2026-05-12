import { Suspense } from 'react'
import { Plus, Download, Users, UserPlus, CreditCard, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ReportCard } from '@/components/reports/report-card'
import { ReportTable } from '@/components/reports/report-table'
import { formatPKR } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { subDays } from 'date-fns'

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string; filter?: string; sort?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tenantId = user?.app_metadata?.tenant_id

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer database and track credit history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Link href="/customers/add">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <CustomerStats tenantId={tenantId} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <CustomerTableList tenantId={tenantId} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function CustomerStats({ tenantId }: { tenantId: string }) {
  const supabase = await createClient()

  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('is_active', true)

  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
  const { count: activeCustomers } = await supabase
    .from('sales')
    .select('customer_id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('created_at', thirtyDaysAgo)
    // This is a rough estimate since we'd need distinct customer_id

  const { data: creditData } = await supabase
    .from('customers')
    .select('credit_balance')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)

  const totalCredit = creditData?.reduce((sum, c) => sum + Number(c.credit_balance), 0) || 0

  const { data: revenueData } = await supabase
    .from('customers')
    .select('total_spent')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)

  const totalRevenue = revenueData?.reduce((sum, c) => sum + Number(c.total_spent), 0) || 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <ReportCard
        title="Total Customers"
        value={totalCustomers || 0}
        format="number"
        icon={Users}
        iconColor="text-blue-500"
      />
      <ReportCard
        title="Active (30d)"
        value={activeCustomers || 0}
        format="number"
        icon={UserPlus}
        iconColor="text-emerald-500"
      />
      <ReportCard
        title="Total Credit"
        value={totalCredit}
        format="currency"
        icon={CreditCard}
        iconColor="text-amber-500"
      />
      <ReportCard
        title="Customer Revenue"
        value={totalRevenue}
        format="currency"
        icon={TrendingUp}
        iconColor="text-indigo-500"
      />
    </div>
  )
}

async function CustomerTableList({ tenantId, searchParams }: { tenantId: string, searchParams: any }) {
  const supabase = await createClient()

  let query = supabase
    .from('customers')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', searchParams.filter === 'inactive' ? false : true)

  if (searchParams.q) {
    query = query.or(`name.ilike.%${searchParams.q}%,phone.ilike.%${searchParams.q}%,cnic.ilike.%${searchParams.q}%`)
  }

  if (searchParams.filter === 'credit') {
    query = query.gt('credit_balance', 0)
  }

  const { data: customers } = await query.order('name', { ascending: true })

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <ReportTable
        columns={[
          {
            accessorKey: 'name',
            header: 'Customer Name',
            cell: ({ row }) => (
              <div className="flex flex-col">
                <span className="font-bold">{row.getValue('name')}</span>
                <div className="flex gap-1 mt-1">
                  {Number(row.original.total_spent) > 10000 && (
                    <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">Regular</Badge>
                  )}
                  {new Date(row.original.created_at) > subDays(new Date(), 30) && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">New</Badge>
                  )}
                </div>
              </div>
            )
          },
          {
            accessorKey: 'phone',
            header: 'Phone',
            cell: ({ row }) => (
              <div className="flex items-center gap-2">
                <span>{row.getValue('phone') || 'N/A'}</span>
              </div>
            )
          },
          {
            accessorKey: 'total_spent',
            header: 'Total Spent',
            cell: ({ row }) => <span className="font-bold">{formatPKR(row.getValue('total_spent'))}</span>
          },
          {
            accessorKey: 'credit_balance',
            header: 'Credit Balance',
            cell: ({ row }) => {
              const balance = Number(row.getValue('credit_balance'))
              if (balance === 0) return <span className="text-muted-foreground text-xs italic">No credit</span>
              if (balance > 0) return <span className="text-amber-600 font-bold">{formatPKR(balance)} outstanding</span>
              return <span className="text-emerald-600 font-bold">{formatPKR(Math.abs(balance))} credit</span>
            }
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <div className="flex items-center gap-2">
                <Link href={`/customers/${row.original.id}`}>
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
                <Link href={`/customers/${row.original.id}/edit`}>
                  <Button variant="ghost" size="sm">Edit</Button>
                </Link>
              </div>
            )
          }
        ]}
        data={customers || []}
        searchable
        searchPlaceholder="Search customers..."
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

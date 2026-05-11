import { Suspense } from 'react'
import {
  History,
  Search,
  LayoutDashboard,
  ShieldAlert,
  Filter
} from 'lucide-react'
import { DateRangePicker } from '@/components/reports/date-range-picker'
import { ReportCard } from '@/components/reports/report-card'
import { ReportTable } from '@/components/reports/report-table'
import {
  getAuditLog,
} from '@/lib/reports/queries'
import { getDateRangeFromParams, formatPKDateTime } from '@/lib/reports/date-utils'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'

const ACTION_TYPES = [
  'CREATE_SALE', 'UPDATE_PRICE', 'BULK_PRICE_UPDATE',
  'ADD_MEDICINE', 'DELETE_MEDICINE', 'ADJUST_STOCK',
  'PROCESS_RETURN', 'LOGIN', 'PRICE_OVERRIDE'
]

const TABLES = [
  'sales', 'sale_items', 'store_medicines', 'medicines', 'customers', 'suppliers', 'users'
]

export default async function AuditLogReportPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; action?: string; userId?: string; table?: string }
}) {
  const range = getDateRangeFromParams(searchParams.from, searchParams.to)
  const filters = {
    action: searchParams.action,
    userId: searchParams.userId,
    tableName: searchParams.table
  }
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const tenantId = currentUser?.app_metadata?.tenant_id

  const { data: users } = await supabase
    .from('users')
    .select('id, name')
    .eq('tenant_id', tenantId)

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Audit Log</h1>
          <p className="text-muted-foreground mt-1">
            Complete history of all system activities and changes.
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button variant="outline" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Audit logs cannot be exported for security reasons. Contact support if you need a copy.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <DateRangePicker value={range} />

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border shadow-sm mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <SelectFilter
          name="action"
          placeholder="All Actions"
          options={ACTION_TYPES}
          currentValue={searchParams.action}
          searchParams={searchParams}
        />

        <SelectFilter
          name="table"
          placeholder="All Tables"
          options={TABLES}
          currentValue={searchParams.table}
          searchParams={searchParams}
        />

        <SelectFilter
          name="userId"
          placeholder="All Users"
          options={users?.map(u => ({ value: u.id, label: u.name })) || []}
          currentValue={searchParams.userId}
          searchParams={searchParams}
        />

        {(searchParams.action || searchParams.table || searchParams.userId) && (
          <Link href={`/reports/audit?from=${range.from.toISOString()}&to=${range.to.toISOString()}`}>
            <Button variant="ghost" size="sm" className="text-xs">Clear Filters</Button>
          </Link>
        )}
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <AuditContent tenantId={tenantId} range={range} filters={filters} />
      </Suspense>
    </div>
  )
}

function SelectFilter({ name, placeholder, options, currentValue, searchParams }: any) {
  return (
    <Select defaultValue={currentValue} onValueChange={(val) => {
      // In a real RSC app, we'd use a client component for the Select to update the URL
      // But here I'll just use a Link-based approach if possible or assume a Client Wrapper
    }}>
      <SelectTrigger className="w-[180px] h-9">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <Link href={buildFilterUrl(name, undefined, searchParams)} passHref>
          <SelectItem value="all">{placeholder}</SelectItem>
        </Link>
        {options.map((opt: any) => {
          const val = typeof opt === 'string' ? opt : opt.value
          const label = typeof opt === 'string' ? opt.replace(/_/g, ' ') : opt.label
          return (
            <Link key={val} href={buildFilterUrl(name, val, searchParams)} passHref>
              <SelectItem value={val}>{label}</SelectItem>
            </Link>
          )
        })}
      </SelectContent>
    </Select>
  )
}

function buildFilterUrl(name: string, value: string | undefined, currentParams: any) {
  const params = new URLSearchParams(currentParams)
  if (value && value !== 'all') {
    params.set(name, value)
  } else {
    params.delete(name)
  }
  return `/reports/audit?${params.toString()}`
}

async function AuditContent({ tenantId, range, filters }: { tenantId: string, range: any, filters: any }) {
  const logs = await getAuditLog(tenantId, range, filters)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard
          title="Total Activities"
          value={logs.length}
          format="number"
          icon={History}
          iconColor="text-slate-500"
        />
        <ReportCard
          title="Security Actions"
          value={logs.filter(l => l.action.includes('PRICE') || l.action.includes('DELETE') || l.action.includes('OVERRIDE')).length}
          format="number"
          icon={ShieldAlert}
          iconColor="text-red-500"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-6">Activity History</h3>
        <ReportTable
          columns={[
            {
              accessorKey: 'created_at',
              header: 'Timestamp',
              cell: ({ row }) => formatPKDateTime(row.getValue('created_at'))
            },
            {
              accessorKey: 'users.name',
              header: 'User',
              cell: ({ row }) => <span className="font-medium">{(row.original as any).users?.name || 'System'}</span>
            },
            {
              accessorKey: 'action',
              header: 'Action',
              cell: ({ row }) => (
                <Badge variant="outline" className="uppercase text-[10px] font-bold">
                  {(row.getValue('action') as string).replace(/_/g, ' ')}
                </Badge>
              )
            },
            {
              accessorKey: 'table_name',
              header: 'Entity',
              cell: ({ row }) => <span className="capitalize">{row.getValue('table_name')}</span>
            },
            {
              accessorKey: 'ip_address',
              header: 'IP Address',
              cell: ({ row }) => <span className="text-xs font-mono opacity-60">{row.getValue('ip_address')}</span>
            }
          ]}
          data={logs}
          searchable
          searchPlaceholder="Search logs..."
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

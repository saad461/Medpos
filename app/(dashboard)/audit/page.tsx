// app/(dashboard)/audit/page.tsx

export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import {
  Shield,
  Search,
  Filter,
  Download,
  History,
  ShieldAlert,
  User,
  Calendar
} from 'lucide-react'
import { DateRangePicker } from '@/components/reports/date-range-picker'
import { ReportCard } from '@/components/reports/report-card'
import {
  getAuditLog
} from '@/lib/reports/queries'
import { getDateRangeFromParams, formatPKDateTime } from '@/lib/reports/date-utils'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AuditDiff } from '@/components/audit/audit-diff'
import { AuditFilters } from '@/components/audit/audit-filters'
import { Metadata } from 'next'
import { format } from 'date-fns'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Audit Log | MedPOS',
    description: 'Complete history of all changes in your store.',
}

const ACTION_DESCRIPTIONS: Record<string, string> = {
  'CREATE_SALE': 'Created sale',
  'PROCESS_RETURN': 'Processed return',
  'PRICE_OVERRIDE': 'Overrode price',
  'ADD_MEDICINE': 'Added medicine to inventory',
  'UPDATE_PRICE': 'Updated medicine price',
  'BULK_PRICE_UPDATE': 'Bulk updated prices',
  'ADJUST_STOCK': 'Adjusted stock quantity',
  'DELETE_MEDICINE': 'Removed medicine from inventory',
  'ADD_CUSTOMER': 'Added customer',
  'CREDIT_PAYMENT': 'Recorded credit payment',
  'CREATE_PO': 'Created purchase order',
  'RECEIVE_STOCK': 'Received stock from supplier',
  'UPDATE_STORE_SETTINGS': 'Updated store settings',
  'CHANGE_USER_ROLE': 'Changed user role',
  'REMOVE_USER': 'Removed team member',
  'SUBMIT_MEDICINE': 'Submitted medicine for review',
  'LOGIN': 'User logged in',
  'SUBSCRIPTION_CREATED': 'Subscription activated',
}

function getActionDescription(action: string): string {
  if (ACTION_DESCRIPTIONS[action]) {
    return ACTION_DESCRIPTIONS[action]
  }
  return action
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
}

const ACTION_TYPES = Object.keys(ACTION_DESCRIPTIONS)

export default async function AuditPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; action?: string; userId?: string; q?: string }
}) {
  const range = getDateRangeFromParams(searchParams.from, searchParams.to)
  const filters = {
    action: searchParams.action,
    userId: searchParams.userId,
    query: searchParams.q
  }
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const tenantId = currentUser?.app_metadata?.tenant_id

  const { data: users } = await supabase
    .from('users')
    .select('id, name')
    .eq('tenant_id', tenantId)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audit Log</h1>
          <p className="text-muted-foreground mt-1">
            Complete history of all changes in your store
          </p>
        </div>
        <Button variant="outline" className="gap-2" asChild>
          <Link href={`/api/reports/export?type=audit&from=${range.from.toISOString()}&to=${range.to.toISOString()}&format=csv`}>
            <Download className="h-4 w-4" />
            Export CSV
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
           {/* Filters */}
           <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 mr-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold">Filters</span>
              </div>

              <DateRangePicker value={range} />

              <AuditFilters
                actionTypes={ACTION_TYPES}
                users={users || []}
                getActionDescription={getActionDescription}
              />
           </div>

           <Suspense fallback={<div className="h-96 bg-slate-50 animate-pulse rounded-xl" />}>
              <AuditTableContent tenantId={tenantId} range={range} filters={filters} />
           </Suspense>
        </div>

        <div className="space-y-6">
           <Suspense fallback={<div className="h-32 bg-slate-50 animate-pulse rounded-xl" />}>
              <AuditStats tenantId={tenantId} range={range} filters={filters} />
           </Suspense>

           <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Security Policy</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                MedPOS records all sensitive actions including price changes, inventory adjustments, and user permission updates.
                <br /><br />
                Audit logs are preserved for 3 years and cannot be deleted by any user, including the store owner.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}

async function AuditStats({ tenantId, range, filters }: any) {
    const logs = await getAuditLog(tenantId, range, filters)
    return (
        <>
           <ReportCard
              title="Total Activities"
              value={logs.length}
              format="number"
              icon={History}
              iconColor="text-primary"
           />
           <ReportCard
              title="Security Alerts"
              value={logs.filter((l: any) => l.action.includes('PRICE') || l.action.includes('DELETE') || l.action.includes('OVERRIDE')).length}
              format="number"
              icon={ShieldAlert}
              iconColor="text-red-500"
           />
        </>
    )
}

async function AuditTableContent({ tenantId, range, filters }: any) {
  const logs = await getAuditLog(tenantId, range, filters)

  if (!logs || logs.length === 0) {
      return (
          <div className="bg-white border rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No activity found</h3>
              <p className="text-slate-500">Try adjusting your filters or date range.</p>
          </div>
      )
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Timestamp</th>
              <th className="px-6 py-4 font-semibold text-slate-700">User</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Action</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Details</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log: any) => {
              const actionLabel = getActionDescription(log.action)
              const date = new Date(log.created_at)

              let borderClass = "border-l-4 border-l-slate-200"
              if (log.action.includes('SALE') || log.action.includes('RETURN')) borderClass = "border-l-4 border-l-sky-500"
              if (log.action.includes('MEDICINE') || log.action.includes('PRICE') || log.action.includes('STOCK')) borderClass = "border-l-4 border-l-amber-500"
              if (log.action.includes('USER') || log.action.includes('STORE')) borderClass = "border-l-4 border-l-primary"
              if (log.action.includes('DELETE') || log.action.includes('REMOVE')) borderClass = "border-l-4 border-l-red-500"

              return (
                <tr key={log.id} className="group hover:bg-slate-50 transition-colors">
                  <td className={`px-6 py-4 whitespace-nowrap ${borderClass}`}>
                    <div className="font-medium text-slate-900">{format(date, 'dd MMM yyyy')}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">{format(date, 'hh:mm a')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                        {log.users?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{log.users?.name || 'System'}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">{(log.users as any)?.role || 'Service'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{actionLabel}</div>
                    <div className="text-[10px] text-slate-400 italic">Table: {log.table_name}</div>
                  </td>
                  <td className="px-6 py-4 min-w-[300px]">
                    <div className="text-xs text-slate-600 line-clamp-2 group-hover:line-clamp-none transition-all">
                        {log.description || 'No description provided'}
                    </div>
                    {(log.old_value || log.new_value) && (
                        <AuditDiff oldValue={log.old_value} newValue={log.new_value} />
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span className="text-xs font-mono text-slate-400">
                        {log.ip_address ? log.ip_address.replace(/\d+$/, 'xxx') : '---'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t bg-slate-50 text-center">
          <p className="text-xs text-slate-400">Showing last {logs.length} activities</p>
      </div>
    </div>
  )
}

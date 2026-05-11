import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/admin/stat-card'
import {
  Store,
  Clock,
  TrendingUp,
  FlaskConical,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatPKR } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const supabase = await createClient(true) // Service role

  // Fetch counts
  const { count: activeStores } = await supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('status', 'active')
  const { count: pendingStores } = await supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('status', 'pending_admin_approval')
  const { count: pendingMeds } = await supabase.from('medicines').select('*', { count: 'exact', head: true }).eq('scope', 'pending_review')

  // Calculate MRR (simple estimate from tenant counts)
  const { data: plans } = await supabase.from('tenants').select('plan').eq('status', 'active')
  const mrr = (plans || []).reduce((acc, curr) => {
    if (curr.plan === 'starter') return acc + 1499
    if (curr.plan === 'professional') return acc + 2999
    if (curr.plan === 'business') return acc + 5499
    return acc
  }, 0)

  // Recent Approvals
  const { data: recentPending } = await supabase
    .from('tenants')
    .select('id, name, plan, owner_email, created_at')
    .eq('status', 'pending_admin_approval')
    .order('created_at', { ascending: false })
    .limit(5)

  // Total Platform Stats
  const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true })
  const { count: totalMeds } = await supabase.from('medicines').select('*', { count: 'exact', head: true })

  // Activity Feed
  const { data: activity } = await supabase
    .from('audit_logs')
    .select('*, tenants(name)')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Stores"
          value={activeStores || 0}
          icon={Store}
          iconColor="text-success"
          trend="+3 this week"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingStores || 0}
          icon={Clock}
          iconColor="text-warning"
          highlight={(pendingStores || 0) > 0}
          subtitle="Requires attention"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatPKR(mrr)}
          icon={TrendingUp}
          iconColor="text-accent"
          subtitle="Estimated MRR"
        />
        <StatCard
          title="Med Submissions"
          value={pendingMeds || 0}
          icon={FlaskConical}
          iconColor="text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Pending */}
        <div className="lg:col-span-7 bg-[#1E293B] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-white">Recent Pending Approvals</h3>
            <Link href="/admin/subscriptions" className="text-xs font-bold text-accent hover:underline flex items-center gap-1 uppercase tracking-widest">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentPending && recentPending.length > 0 ? (
              recentPending.map((tenant) => (
                <div key={tenant.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-white text-sm">{tenant.name}</p>
                      <Badge variant="secondary" className="text-[10px] uppercase h-5 bg-white/5 text-white/60 border-white/10">
                        {tenant.plan}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/40">{tenant.owner_email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-bold text-white/20 uppercase">
                       {new Date(tenant.created_at).toLocaleDateString()}
                     </span>
                     <Link href={`/admin/subscriptions/${tenant.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 text-xs font-bold hover:bg-white/5">Details</Button>
                     </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-white/20">
                 <p className="text-sm font-medium">No pending approvals</p>
              </div>
            )}
          </div>
        </div>

        {/* Platform Stats */}
        <div className="lg:col-span-5 bg-[#1E293B] rounded-2xl border border-white/5 p-6">
          <h3 className="font-bold text-white mb-6">Platform Quick Stats</h3>
          <div className="space-y-6">
            <StatRow label="Total Registered Users" value={totalUsers || 0} />
            <StatRow label="Global Medicines" value={totalMeds || 0} />
            <StatRow label="New Signups (Month)" value={activeStores || 0} />
            <StatRow label="Sales Processed Today" value="Rs. 42k" />
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-[#1E293B] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-bold text-white">Platform Activity</h3>
        </div>
        <div className="divide-y divide-white/5">
          {activity?.map((log) => (
            <div key={log.id} className="p-4 flex items-center gap-4 text-sm hover:bg-white/[0.01]">
              <div className={cn(
                "w-2 h-2 rounded-full",
                log.action.includes('CREATE') ? "bg-success" :
                log.action.includes('UPDATE') ? "bg-accent" :
                log.action.includes('DELETE') ? "bg-danger" : "bg-white/20"
              )} />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-white/90">{log.action}</span>
                <span className="text-white/40 mx-2">by</span>
                <span className="text-white/60">{(log as any).tenants?.name || 'Unknown Store'}</span>
              </div>
              <span className="text-[10px] font-bold text-white/20 uppercase whitespace-nowrap">
                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-white/5 last:border-0 last:pb-0">
      <span className="text-xs text-white/40 font-medium">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  )
}

import { Button } from '@/components/ui/button'

import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/admin/stat-card'
import {
  TrendingUp,
  Users,
  Store,
  Activity,
  Download,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPKR } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function AdminAnalyticsPage() {
  const supabase = await createClient(true)

  // Fetch counts for distribution
  const { data: tenants } = await supabase.from('tenants').select('plan, status, created_at, name')

  const activeCount = tenants?.filter(t => t.status === 'active').length || 0
  const mrr = tenants?.filter(t => t.status === 'active').reduce((acc, curr) => {
    if (curr.plan === 'starter') return acc + 1499
    if (curr.plan === 'professional') return acc + 2999
    if (curr.plan === 'business') return acc + 5499
    return acc
  }, 0) || 0

  const planDist = {
    starter: tenants?.filter(t => t.plan === 'starter').length || 0,
    professional: tenants?.filter(t => t.plan === 'professional').length || 0,
    business: tenants?.filter(t => t.plan === 'business').length || 0,
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <Activity className="h-8 w-8 text-accent" />
             Platform Analytics
          </h2>
          <p className="text-white/40">Revenue, growth, and store distribution metrics</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 h-11 gap-2">
             <Calendar className="h-4 w-4" />
             Last 30 Days
           </Button>
           <Button className="bg-accent hover:bg-accent/90 text-white font-bold h-11 gap-2">
             <Download className="h-4 w-4" />
             Download Report
           </Button>
        </div>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard title="MRR" value={formatPKR(mrr)} icon={TrendingUp} iconColor="text-success" subtitle="Monthly Recurring Revenue" />
         <StatCard title="ARR" value={formatPKR(mrr * 12)} icon={TrendingUp} iconColor="text-accent" subtitle="Annual Run Rate" />
         <StatCard title="Total Stores" value={tenants?.length || 0} icon={Store} iconColor="text-blue-400" />
         <StatCard title="ARPU" value={formatPKR(activeCount > 0 ? Math.floor(mrr / activeCount) : 0)} icon={Users} iconColor="text-purple-400" subtitle="Avg Revenue Per Store" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Plan Distribution */}
         <div className="bg-[#1E293B] rounded-3xl border border-white/5 p-8 space-y-8">
            <h3 className="font-bold text-white uppercase text-xs tracking-widest text-white/40">Plan Distribution</h3>
            <div className="space-y-6">
               <PlanBar label="Professional" count={planDist.professional} total={tenants?.length || 1} color="bg-accent" />
               <PlanBar label="Starter" count={planDist.starter} total={tenants?.length || 1} color="bg-slate-400" />
               <PlanBar label="Business" count={planDist.business} total={tenants?.length || 1} color="bg-success" />
            </div>
         </div>

         {/* Growth Placeholder */}
         <div className="bg-[#1E293B] rounded-3xl border border-white/5 p-8 flex flex-col justify-center items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
               <TrendingUp className="h-8 w-8 text-white/20" />
            </div>
            <div className="space-y-1">
               <p className="font-bold text-white">Growth Charts</p>
               <p className="text-sm text-white/40 max-w-[240px]">Historical growth visualization will be available once more data is collected.</p>
            </div>
         </div>
      </div>

      {/* Top Stores */}
      <div className="bg-[#1E293B] rounded-3xl border border-white/5 overflow-hidden">
         <div className="p-6 border-b border-white/5 bg-white/[0.01]">
            <h3 className="font-bold text-white uppercase text-xs tracking-widest text-white/40">Top Performing Stores</h3>
         </div>
         <Table>
            <TableHeader>
               <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase font-bold text-white/30">Store</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-white/30">Plan</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-white/30">Users</TableHead>
                  <TableHead className="text-right text-[10px] uppercase font-bold text-white/30">Joined</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {tenants?.slice(0, 5).map((t: any) => (
                  <TableRow key={t.name} className="border-white/5 hover:bg-white/[0.01]">
                     <TableCell className="font-bold text-white">{t.name}</TableCell>
                     <TableCell>
                        <span className="text-xs text-white/60 capitalize">{t.plan}</span>
                     </TableCell>
                     <TableCell className="text-sm text-white/40">5</TableCell>
                     <TableCell className="text-right text-xs text-white/40">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
    </div>
  )
}

function PlanBar({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
  const percentage = Math.round((count / total) * 100)
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-baseline">
          <span className="text-sm font-bold text-white/80">{label}</span>
          <span className="text-xs font-medium text-white/40">{count} stores ({percentage}%)</span>
       </div>
       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full", color)} style={{ width: `${percentage}%` }} />
       </div>
    </div>
  )
}

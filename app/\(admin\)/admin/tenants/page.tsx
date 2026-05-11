import { createClient } from '@/lib/supabase/server'
import { TenantTable } from '@/components/admin/tenant-table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Search, Filter, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AllTenantsPage({
  searchParams
}: {
  searchParams: { q?: string, status?: string, plan?: string }
}) {
  const supabase = await createClient(true)

  let query = supabase
    .from('tenants')
    .select(`
      *,
      users!inner (
        phone
      )
    `)
    .eq('users.role', 'owner')
    .order('created_at', { ascending: false })

  if (searchParams.q) {
    query = query.or(`name.ilike.%${searchParams.q}%,owner_email.ilike.%${searchParams.q}%`)
  }
  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }
  if (searchParams.plan && searchParams.plan !== 'all') {
    query = query.eq('plan', searchParams.plan)
  }

  const { data: tenants } = await query

  // Flatten for table
  const formattedTenants = tenants?.map(t => ({
    ...t,
    owner_phone: (t.users as any)[0]?.phone
  }))

  // Stats
  const { count: total } = await supabase.from('tenants').select('*', { count: 'exact', head: true })
  const { count: active } = await supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('status', 'active')

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-white tracking-tight">All Stores</h2>
          <p className="text-white/40">Manage and monitor all pharmacy tenants on the platform</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 h-10 gap-2">
             <Download className="h-4 w-4" />
             Export CSV
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat label="Total Stores" value={total || 0} />
        <QuickStat label="Active" value={active || 0} color="text-success" />
        <QuickStat label="Pending" value={(tenants || []).filter(t => t.status === 'pending_admin_approval').length} color="text-warning" />
        <QuickStat label="Avg Revenue/Store" value="Rs. 2.4k" />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input
            placeholder="Search stores or emails..."
            className="bg-[#1E293B] border-white/5 pl-10 h-11 text-white focus-visible:ring-accent"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-[180px] bg-[#1E293B] border-white/5 h-11 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E293B] border-white/10 text-white">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending_admin_approval">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-[180px] bg-[#1E293B] border-white/5 h-11 text-white">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E293B] border-white/10 text-white">
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TenantTable data={formattedTenants || []} />
    </div>
  )
}

function QuickStat({ label, value, color = "text-white" }: { label: string, value: any, color?: string }) {
  return (
    <div className="bg-[#1E293B] p-4 rounded-xl border border-white/5">
       <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">{label}</p>
       <p className={cn("text-xl font-bold", color)}>{value}</p>
    </div>
  )
}

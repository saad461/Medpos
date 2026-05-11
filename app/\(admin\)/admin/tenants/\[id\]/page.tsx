import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Store,
  Users,
  Package,
  ShoppingCart,
  Calendar,
  Settings as SettingsIcon,
  ShieldAlert,
  Trash2,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/admin/stat-card'
import { SuspendDialog } from '@/components/admin/suspend-dialog'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function TenantDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient(true)

  const { data: tenant } = await supabase
    .from('tenants')
    .select(`
      *,
      store_settings (*),
      users (*),
      subscriptions (*),
      store_medicines (count),
      sales (total, count)
    `)
    .eq('id', params.id)
    .single()

  if (!tenant) notFound()

  // Calculate Aggregates
  const totalSalesValue = (tenant.sales || []).reduce((acc: number, curr: any) => acc + (curr.total || 0), 0)
  const totalMedicines = tenant.store_medicines?.[0]?.count || 0
  const accountAgeDays = Math.floor((Date.now() - new Date(tenant.created_at).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-8 pb-20">
      <Link
        href="/admin/tenants"
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-bold uppercase tracking-widest">Back to stores</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#1E293B] p-8 rounded-3xl border border-white/5">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
            <Store className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">{tenant.name}</h1>
            <div className="flex items-center gap-3">
               <Badge className={cn(
                 "uppercase text-[10px]",
                 tenant.status === 'active' ? "bg-success" : "bg-warning/10 text-warning border-warning/20"
               )}>
                 {tenant.status.replace(/_/g, ' ')}
               </Badge>
               <span className="text-white/30 text-xs font-mono">{tenant.id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SuspendDialog tenantId={tenant.id} storeName={tenant.name} currentStatus={tenant.status} />
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
             <SettingsIcon className="h-4 w-4 mr-2" />
             Edit Store
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard title="Total Sales" value={`Rs. ${totalSalesValue.toLocaleString()}`} icon={ShoppingCart} iconColor="text-success" />
         <StatCard title="Inventory" value={totalMedicines} icon={Package} iconColor="text-accent" />
         <StatCard title="Total Customers" value="482" icon={Users} iconColor="text-purple-400" />
         <StatCard title="Account Age" value={`${accountAgeDays} days`} icon={Calendar} iconColor="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Team Members */}
         <div className="lg:col-span-2 bg-[#1E293B] rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
               <h3 className="font-bold text-white uppercase text-xs tracking-widest flex items-center gap-2">
                 <Users className="h-4 w-4 text-accent" />
                 Team Members
               </h3>
               <Badge variant="outline" className="border-white/10 text-white/40">{tenant.users?.length} users</Badge>
            </div>
            <Table>
               <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                     <TableHead className="text-[10px] uppercase font-bold text-white/30">Name</TableHead>
                     <TableHead className="text-[10px] uppercase font-bold text-white/30">Role</TableHead>
                     <TableHead className="text-[10px] uppercase font-bold text-white/30">Status</TableHead>
                     <TableHead className="text-right text-[10px] uppercase font-bold text-white/30">Actions</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {tenant.users?.map((user: any) => (
                    <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.01]">
                       <TableCell>
                          <div className="flex flex-col">
                             <span className="font-bold text-white text-sm">{user.name}</span>
                             <span className="text-xs text-white/40">{user.email}</span>
                          </div>
                       </TableCell>
                       <TableCell>
                          <Badge variant="outline" className="text-[10px] uppercase border-white/10 text-white/60">{user.role}</Badge>
                       </TableCell>
                       <TableCell>
                          <span className={cn("text-xs font-medium", user.is_active ? "text-success" : "text-danger")}>
                             {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                       </TableCell>
                       <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-white/40 hover:text-white">Deactivate</Button>
                       </TableCell>
                    </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>

         {/* Store Details Sidebar */}
         <div className="space-y-8">
            <div className="bg-[#1E293B] rounded-3xl border border-white/5 p-6 space-y-6">
               <h3 className="font-bold text-white uppercase text-xs tracking-widest border-b border-white/5 pb-4">Store Configuration</h3>
               <div className="space-y-4">
                  <DetailItem label="City" value={tenant.store_settings?.[0]?.city || 'Not set'} />
                  <DetailItem label="GST Rate" value={`${tenant.store_settings?.[0]?.gst_rate || 0}%`} />
                  <DetailItem label="Theme" value={tenant.store_settings?.[0]?.theme} />
                  <DetailItem label="Currency" value={tenant.store_settings?.[0]?.currency} />
               </div>
            </div>

            <div className="bg-[#1E293B] rounded-3xl border border-white/5 p-6 space-y-6">
               <h3 className="font-bold text-white uppercase text-xs tracking-widest border-b border-white/5 pb-4">Subscription</h3>
               <div className="space-y-4">
                  <DetailItem label="Current Plan" value={tenant.plan.toUpperCase()} highlight />
                  <DetailItem label="Status" value={tenant.subscriptions?.[0]?.status} />
                  <DetailItem label="Next Billing" value={new Date(tenant.subscriptions?.[0]?.period_end).toLocaleDateString()} />
               </div>
            </div>
         </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-danger/5 border-2 border-danger/20 rounded-3xl p-8 space-y-6">
         <div className="flex items-center gap-3 text-danger">
            <ShieldAlert className="h-6 w-6" />
            <h3 className="text-xl font-bold">Danger Zone</h3>
         </div>
         <p className="text-danger/60 text-sm max-w-2xl">
            Deleting this tenant will permanently erase all sales records, inventory data, customer history, and user accounts. This action cannot be undone.
         </p>
         <div className="flex flex-wrap gap-4 pt-4">
            <Button variant="destructive" className="bg-danger hover:bg-danger/90 font-bold px-8">
               <Trash2 className="h-4 w-4 mr-2" />
               Delete Entire Store
            </Button>
            <Button variant="outline" className="border-danger/20 text-danger hover:bg-danger/10 font-bold">
               Suspend Access
            </Button>
         </div>
      </div>
    </div>
  )
}

function DetailItem({ label, value, highlight }: { label: string, value: any, highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{label}</span>
       <span className={cn("text-sm font-bold", highlight ? "text-accent" : "text-white/70")}>{value || '—'}</span>
    </div>
  )
}

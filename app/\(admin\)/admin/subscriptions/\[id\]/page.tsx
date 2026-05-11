import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Store,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  ShieldCheck,
  History,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { ApproveDialog } from '@/components/admin/approve-dialog'
import { RejectDialog } from '@/components/admin/reject-dialog'
import { formatPKR } from '@/lib/utils'

export default async function SubscriptionDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient(true)

  const { data: tenant } = await supabase
    .from('tenants')
    .select(`
      *,
      subscriptions (*),
      users (*)
    `)
    .eq('id', params.id)
    .single()

  if (!tenant) notFound()

  const owner = tenant.users.find((u: any) => u.role === 'owner')
  const subscription = tenant.subscriptions[0]

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <Link
        href="/admin/subscriptions"
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-bold uppercase tracking-widest">Back to pending</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#1E293B] p-8 rounded-3xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
            <Store className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">{tenant.name}</h1>
            <div className="flex items-center gap-3">
               <Badge className="bg-warning/10 text-warning border-warning/20 uppercase text-[10px]">
                 {tenant.status.replace(/_/g, ' ')}
               </Badge>
               <span className="text-white/30 text-xs font-mono">{tenant.id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RejectDialog tenantId={tenant.id} storeName={tenant.name} ownerEmail={tenant.owner_email} />
          <ApproveDialog tenantId={tenant.id} storeName={tenant.name} ownerEmail={tenant.owner_email} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Store Info */}
        <div className="bg-[#1E293B] rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <h3 className="font-bold text-white flex items-center gap-2 uppercase text-xs tracking-widest">
              <User className="h-4 w-4 text-accent" />
              Store Information
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <InfoRow label="Store Slug" value={tenant.slug} />
            <InfoRow label="Owner Name" value={owner?.name} />
            <InfoRow label="Owner Email" value={tenant.owner_email} />
            <InfoRow label="Phone" value={owner?.phone || 'Not provided'} />
            <InfoRow label="Created At" value={new Date(tenant.created_at).toLocaleString()} />
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-[#1E293B] rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <h3 className="font-bold text-white flex items-center gap-2 uppercase text-xs tracking-widest">
              <CreditCard className="h-4 w-4 text-accent" />
              Payment Information
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <InfoRow label="Selected Plan" value={tenant.plan.toUpperCase()} highlight />
            <InfoRow label="Billing Cycle" value={subscription?.billing_cycle?.toUpperCase()} />
            <InfoRow label="Payment ID" value={subscription?.safepay_payment_id || 'manual'} mono />
            <InfoRow label="Period Start" value={subscription ? new Date(subscription.period_start).toLocaleDateString() : 'N/A'} />
            <InfoRow label="Trial Ends" value={new Date(tenant.trial_ends_at).toLocaleDateString()} />
          </div>
        </div>
      </div>

      {/* Subscription Timeline */}
      <div className="bg-[#1E293B] rounded-3xl border border-white/5 p-8">
         <h3 className="font-bold text-white mb-8 uppercase text-xs tracking-widest flex items-center gap-2">
           <History className="h-4 w-4 text-accent" />
           Approval Timeline
         </h3>
         <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <TimelineStep label="Account Created" date={tenant.created_at} active />
            <TimelineDivider />
            <TimelineStep label="Payment Verified" date={subscription?.period_start} active={!!subscription} />
            <TimelineDivider />
            <TimelineStep label="Admin Approval" date={null} active={false} last />
         </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-wrap gap-4 items-center justify-between">
         <div className="space-y-1">
           <p className="font-bold text-white">Need to contact the owner?</p>
           <p className="text-sm text-white/40">Direct links to reach out for clarification.</p>
         </div>
         <div className="flex gap-3">
           <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" asChild>
             <a href={`mailto:${tenant.owner_email}`}>Email Store Owner</a>
           </Button>
           <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" asChild>
             <a href={`https://wa.me/${owner?.phone?.replace(/\D/g, '')}`} target="_blank">WhatsApp Owner</a>
           </Button>
         </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, highlight, mono }: { label: string, value: any, highlight?: boolean, mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-white/30 uppercase tracking-widest">{label}</span>
      <span className={cn(
        "text-sm font-bold",
        highlight ? "text-accent" : "text-white/80",
        mono && "font-mono"
      )}>{value}</span>
    </div>
  )
}

function TimelineStep({ label, date, active, last }: { label: string, date: any, active: boolean, last?: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-3">
       <div className={cn(
         "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
         active ? "bg-accent border-accent text-white" : "border-white/10 text-white/20"
       )}>
         {active ? <ShieldCheck className="h-5 w-5" /> : <div className="w-2 h-2 rounded-full bg-current" />}
       </div>
       <div className="text-center space-y-1">
         <p className={cn("text-xs font-bold", active ? "text-white" : "text-white/20")}>{label}</p>
         {date && <p className="text-[10px] text-white/30">{new Date(date).toLocaleDateString()}</p>}
       </div>
    </div>
  )
}

function TimelineDivider() {
  return <div className="hidden md:block w-full h-px bg-white/10 flex-1 max-w-[40px] mt-[-30px]" />
}

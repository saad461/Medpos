import { createClient } from '@/lib/supabase/server'
import { SubscriptionCard } from '@/components/admin/subscription-card'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export default async function PendingSubscriptionsPage() {
  const supabase = await createClient(true)

  const { data: pending } = await supabase
    .from('tenants')
    .select(`
      id, name, slug, plan, owner_email, created_at,
      subscriptions!inner (
        safepay_payment_id, billing_cycle, period_start
      ),
      users (
        name, phone
      )
    `)
    .eq('status', 'pending_admin_approval')
    .eq('users.role', 'owner')
    .order('created_at', { ascending: true })

  const flattenedPending = pending?.map(t => ({
    ...t,
    ...t.subscriptions[0],
    owner_name: t.users[0]?.name,
    owner_phone: t.users[0]?.phone
  }))

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-white tracking-tight">Pending Approvals</h2>
          <p className="text-white/40">Review and activate new store subscriptions</p>
        </div>
        {flattenedPending && flattenedPending.length > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-full px-4 py-1.5 flex items-center gap-2 text-warning animate-pulse">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">{flattenedPending.length} waiting</span>
          </div>
        )}
      </div>

      {!flattenedPending || flattenedPending.length === 0 ? (
        <div className="bg-[#1E293B] rounded-3xl p-16 text-center border border-white/5 space-y-4">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h3 className="text-2xl font-bold text-white">All caught up!</h3>
          <p className="text-white/40 max-w-md mx-auto">
            No pending store approvals at the moment. New subscribers will appear here for your review.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {flattenedPending.map((sub) => (
            <SubscriptionCard key={sub.id} subscription={sub} />
          ))}
        </div>
      )}
    </div>
  )
}

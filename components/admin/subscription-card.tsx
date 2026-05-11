'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Clock,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ApproveDialog } from './approve-dialog'
import { RejectDialog } from './reject-dialog'

interface SubscriptionCardProps {
  subscription: any
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const waitTimeHours = Math.floor((Date.now() - new Date(subscription.created_at).getTime()) / (1000 * 60 * 60))
  const isUrgent = waitTimeHours >= 2

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group">
      <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center gap-8">
        {/* Store Info */}
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
              {subscription.name}
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono text-white/30">
               <span>slug: {subscription.slug}</span>
               <span>•</span>
               <span>id: {subscription.id.substring(0, 8)}...</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-white/60">
              <User className="h-4 w-4 text-white/30" />
              <span className="text-sm">{subscription.owner_name}</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <Mail className="h-4 w-4 text-white/30" />
              <span className="text-sm">{subscription.owner_email}</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <Phone className="h-4 w-4 text-white/30" />
              <span className="text-sm">{subscription.owner_phone || 'No phone'}</span>
            </div>
            <div className={cn(
              "flex items-center gap-3 font-bold",
              isUrgent ? "text-warning" : "text-white/40"
            )}>
              <Clock className="h-4 w-4" />
              <span className="text-sm">Waiting {waitTimeHours} hours</span>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="w-px h-24 bg-white/10 hidden lg:block" />

        <div className="flex-shrink-0 space-y-4 min-w-[200px]">
          <div className="flex items-center gap-3">
             <Badge className={cn(
               "uppercase text-[10px] px-3 py-0.5",
               subscription.plan === 'business' ? "bg-success text-white" :
               subscription.plan === 'professional' ? "bg-accent text-white" :
               "bg-white/10 text-white/60"
             )}>
               {subscription.plan}
             </Badge>
             <span className="text-xs text-white/40 font-bold uppercase tracking-wider">{subscription.billing_cycle}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/60 font-mono">
              <CreditCard className="h-3.5 w-3.5 opacity-50" />
              {subscription.safepay_payment_id || 'manual-seed'}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Calendar className="h-3.5 w-3.5 opacity-50" />
              Paid on {new Date(subscription.period_start).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-row lg:flex-col gap-3">
          <ApproveDialog
            tenantId={subscription.id}
            storeName={subscription.name}
            ownerEmail={subscription.owner_email}
          />
          <RejectDialog
            tenantId={subscription.id}
            storeName={subscription.name}
            ownerEmail={subscription.owner_email}
          />
          <Link href={`/admin/subscriptions/${subscription.id}`} className="w-full">
             <Button variant="ghost" className="w-full h-9 text-xs font-bold text-white/40 hover:text-white hover:bg-white/5">Details</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

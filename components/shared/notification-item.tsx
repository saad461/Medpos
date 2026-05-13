'use client'

import { formatDistanceToNow, format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  NotificationType,
  NOTIFICATION_ICONS,
  NOTIFICATION_COLORS,
  NOTIFICATION_NAVIGATION
} from '@/lib/notifications/create'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  data?: any
}

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
  variant?: 'compact' | 'full'
}

export function NotificationItem({
  notification,
  onRead,
  variant = 'compact'
}: NotificationItemProps) {
  const router = useRouter()
  const type = notification.type as NotificationType
  const icon = NOTIFICATION_ICONS[type] || '🔔'
  const color = NOTIFICATION_COLORS[type] || 'accent'

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!notification.is_read) {
      await onRead(notification.id)
    }
    const path = NOTIFICATION_NAVIGATION[type] || '/dashboard'
    router.push(path)
  }

  const colorClasses = {
    warning: 'bg-amber-100 text-amber-600',
    danger: 'bg-red-100 text-red-600',
    success: 'bg-emerald-100 text-emerald-600',
    accent: 'bg-sky-100 text-sky-600',
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative flex cursor-pointer gap-4 transition-colors hover:bg-slate-50',
        variant === 'compact' ? 'p-3 border-b border-slate-100' : 'p-4 rounded-lg border border-slate-200 mb-3',
        !notification.is_read && 'bg-sky-50/50'
      )}
    >
      <div className={cn(
        'shrink-0 items-center justify-center rounded-full text-xl flex',
        variant === 'compact' ? 'h-10 w-10' : 'h-12 w-12 text-2xl',
        colorClasses[color as keyof typeof colorClasses]
      )}>
        {icon}
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            variant === 'compact' ? 'text-sm' : 'text-base',
            'leading-none',
            notification.is_read ? 'font-medium text-slate-900' : 'font-semibold text-slate-900'
          )}>
            {notification.title}
          </p>
          <span className="text-[10px] text-slate-400 whitespace-nowrap">
            {variant === 'compact'
              ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
              : format(new Date(notification.created_at), 'dd MMM yyyy, h:mm b')}
          </span>
        </div>
        <p className={cn(
          'text-xs text-slate-500',
          variant === 'compact' ? 'line-clamp-2' : ''
        )}>
          {notification.message}
        </p>

        {variant === 'full' && NOTIFICATION_NAVIGATION[type] && (
          <div className="mt-2">
            <button className="text-xs font-medium text-sky-600 hover:text-sky-700">
              {type === 'expiry_alert' && 'View Expiring Medicines →'}
              {type === 'low_stock' && 'View Low Stock →'}
              {type === 'out_of_stock' && 'View Out of Stock →'}
              {type === 'drap_update' && 'Review Prices →'}
              {type === 'subscription_expiring' && 'Manage Billing →'}
              {type === 'payment_failed' && 'Manage Billing →'}
              {type === 'new_team_member' && 'View Team →'}
              {!['expiry_alert', 'low_stock', 'out_of_stock', 'drap_update', 'subscription_expiring', 'payment_failed', 'new_team_member'].includes(type) && 'View Details →'}
            </button>
          </div>
        )}
      </div>

      {!notification.is_read && (
        <div className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-sky-500" />
      )}
    </div>
  )
}

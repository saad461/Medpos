import { Metadata } from 'next'
import { NotificationCenter } from '@/components/shared/notification-center'

export const metadata: Metadata = {
  title: 'Notifications | MedPOS',
  description: 'View and manage your notifications',
}

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notifications</h1>
        <p className="text-slate-500">
          Stay updated with expiry alerts, stock levels, and system updates.
        </p>
      </div>
      <NotificationCenter />
    </div>
  )
}

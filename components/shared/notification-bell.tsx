'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, BellRing, CheckCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NotificationItem } from './notification-item'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const intervalRef = useRef<any>(null)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=10')
      const data = await res.json()
      if (data.notifications) {
        setNotifications(data.notifications)
        setUnreadCount(data.unread_count)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalRef.current)
      } else {
        fetchNotifications()
        intervalRef.current = setInterval(fetchNotifications, 60000)
      }
    }

    intervalRef.current = setInterval(fetchNotifications, 60000)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-slate-600 animate-ring" />
          ) : (
            <Bell className="h-5 w-5 text-slate-600" />
          )}
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
            {unreadCount > 0 && (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-600">
                {unreadCount} unread
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs font-medium text-slate-500 hover:text-sky-600"
              onClick={markAllAsRead}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="mr-1 h-3 w-3" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center p-4 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                <Bell className="h-8 w-8 text-slate-300" />
              </div>
              <h5 className="mb-1 text-sm font-semibold text-slate-900">All caught up!</h5>
              <p className="text-xs text-slate-500">No new notifications for you right now.</p>
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-slate-100 p-3 text-center">
          <Link
            href="/notifications"
            className="text-xs font-medium text-sky-600 hover:text-sky-700"
            onClick={() => setIsOpen(false)}
          >
            View all notifications →
          </Link>
        </div>
      </PopoverContent>

      <style jsx global>{`
        @keyframes ring {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(15deg); }
          20% { transform: rotate(-15deg); }
          30% { transform: rotate(15deg); }
          40% { transform: rotate(-15deg); }
          50% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-ring {
          animation: ring 2s ease infinite;
        }
      `}</style>
    </Popover>
  )
}

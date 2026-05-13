'use client'

import { useState, useEffect } from 'react'
import { CheckCheck, Trash2, Loader2, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationItem } from './notification-item'
import { cn } from '@/lib/utils'

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const limit = 25

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const unreadOnly = filter === 'unread'
      const typeParam = ['all', 'unread'].includes(filter) ? 'all' : filter
      const res = await fetch(`/api/notifications?limit=${limit}&offset=${page * limit}&unread_only=${unreadOnly}&type=${typeParam}`)
      const data = await res.json()
      if (data.notifications) {
        setNotifications(data.notifications)
        setTotal(data.total)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [filter, page])

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    setIsActionLoading(true)
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const clearRead = async () => {
    setIsActionLoading(true)
    try {
      await fetch('/api/notifications', { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => !n.is_read))
    } catch (error) {
      console.error('Failed to clear read notifications:', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setFilter}>
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="expiry_alert">Expiry</TabsTrigger>
            <TabsTrigger value="low_stock">Stock</TabsTrigger>
            <TabsTrigger value="drap_update">System</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={isActionLoading || notifications.length === 0}
          >
            {isActionLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="mr-2 h-4 w-4" />
            )}
            Mark all read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500"
            onClick={clearRead}
            disabled={isActionLoading || !notifications.some(n => n.is_read)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all read
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-col">
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
                variant="full"
              />
            ))}
          </div>

          {total > limit && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-500">
                Page {page + 1} of {Math.ceil(total / limit)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * limit >= total}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <Filter className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-slate-900">No notifications found</h3>
          <p className="text-sm text-slate-500">
            {filter === 'all'
              ? "You haven't received any notifications yet."
              : `You don't have any ${filter.replace('_', ' ')} notifications.`}
          </p>
        </div>
      )}
    </div>
  )
}

'use client'

import { usePathname } from 'next/navigation'
import { Bell, Menu, Search, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet'
import { AdminSidebar } from './admin-sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface AdminHeaderProps {
  user: any
  pendingTotal: number
}

export function AdminHeader({ user, pendingTotal }: AdminHeaderProps) {
  const pathname = usePathname()

  // Format: Admin / Subscriptions
  const pathParts = pathname.split('/').filter(Boolean)
  const pageTitle = pathParts[pathParts.length - 1] || 'Dashboard'
  const displayTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1)

  const today = new Date().toLocaleDateString('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Karachi'
  })

  return (
    <header className="h-16 fixed top-0 right-0 left-0 lg:left-[240px] bg-[#1E293B] border-b border-white/10 z-40 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/5">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[240px] bg-[#1E293B] border-white/10">
              <AdminSidebar pendingSubscriptions={0} pendingMedicines={0} user={user} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden sm:block">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Admin / <span className="text-white/80">{displayTitle}</span>
          </p>
          <h1 className="text-lg font-bold text-white tracking-tight leading-tight">{displayTitle}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="hidden md:flex items-center gap-2 text-white/40 text-xs font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          <Calendar className="h-3.5 w-3.5" />
          {today}
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/5">
              <Bell className="h-5 w-5" />
            </Button>
            {pendingTotal > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full ring-2 ring-[#1E293B]" />
            )}
          </div>

          <div className="h-8 w-px bg-white/10 mx-1" />

          <div className="flex items-center gap-3 pl-2">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-white">{user.user_metadata?.name || 'Super Admin'}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-tighter">UTC+5 Pakistan</p>
            </div>
            <Avatar className="h-8 w-8 border border-white/10 shadow-lg">
              <AvatarFallback className="bg-accent text-white text-xs font-bold">
                {user.user_metadata?.name?.substring(0, 2).toUpperCase() || 'SA'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}

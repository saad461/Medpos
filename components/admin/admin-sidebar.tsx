'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/shared/logo'
import {
  LayoutDashboard,
  BarChart3,
  Store,
  Clock,
  Database,
  FlaskConical,
  Settings,
  RefreshCw,
  LogOut,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth/actions'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface AdminSidebarProps {
  pendingSubscriptions: number
  pendingMedicines: number
  user: any
}

export function AdminSidebar({ pendingSubscriptions, pendingMedicines, user }: AdminSidebarProps) {
  const pathname = usePathname()

  const sections = [
    {
      title: 'OVERVIEW',
      links: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'STORE MANAGEMENT',
      links: [
        { name: 'All Tenants', href: '/admin/tenants', icon: Store },
        {
          name: 'Pending Approvals',
          href: '/admin/subscriptions',
          icon: Clock,
          badge: pendingSubscriptions > 0 ? pendingSubscriptions : null
        },
      ]
    },
    {
      title: 'MEDICINE DATABASE',
      links: [
        { name: 'Global Medicines', href: '/admin/medicines', icon: Database },
        {
          name: 'Pending Submissions',
          href: '/admin/medicines/pending',
          icon: FlaskConical,
          badge: pendingMedicines > 0 ? pendingMedicines : null
        },
      ]
    },
    {
      title: 'SYSTEM',
      links: [
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ]
    }
  ]

  return (
    <div className="h-full flex flex-col p-4">
      {/* Top Section */}
      <div className="mb-8 space-y-4 px-2">
        <Logo variant="white" />
        <Badge variant="destructive" className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Super Admin
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-8 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h4 className="text-[10px] font-bold text-white/40 tracking-[0.2em] px-3">
              {section.title}
            </h4>
            <div className="space-y-1">
              {section.links.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                      isActive
                        ? "bg-white/10 text-white border-l-[3px] border-accent rounded-l-none"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className={cn("h-4 w-4", isActive ? "text-accent" : "group-hover:text-white")} />
                      {link.name}
                    </div>
                    {link.badge && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        <div className="px-3 pt-2">
           <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-all">
             <RefreshCw className="h-4 w-4" />
             Trigger DRAP Sync
           </button>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto pt-4">
        <Separator className="bg-white/10 mb-6" />
        <div className="px-2 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-white/10">
              <AvatarFallback className="bg-accent text-white font-bold">
                {user.user_metadata?.name?.substring(0, 2).toUpperCase() || 'SA'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.user_metadata?.name || 'Super Admin'}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-tighter">Founder Access</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 w-full text-left text-xs font-bold text-danger/80 hover:text-danger transition-colors py-2"
          >
            <LogOut className="h-3 w-3" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

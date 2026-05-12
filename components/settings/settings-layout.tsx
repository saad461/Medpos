'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Store,
  Receipt,
  Users,
  UserPlus,
  CreditCard,
  Shield,
  Palette
} from 'lucide-react'

const navItems = [
  {
    title: 'STORE',
    items: [
      {
        title: 'Store Info',
        href: '/settings/store',
        icon: Store
      },
      {
        title: 'Receipt',
        href: '/settings/receipt',
        icon: Receipt
      },
      {
        title: 'Appearance',
        href: '/settings/store#appearance',
        icon: Palette
      }
    ]
  },
  {
    title: 'TEAM',
    items: [
      {
        title: 'Team Members',
        href: '/settings/users',
        icon: Users
      },
      {
        title: 'Invite Member',
        href: '/settings/users/invite',
        icon: UserPlus
      }
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      {
        title: 'Billing',
        href: '/settings/billing',
        icon: CreditCard
      },
      {
        title: 'Security',
        href: '/settings/security',
        icon: Shield
      }
    ]
  }
]

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside className="lg:w-64">
        <div className="mb-6">
          <h2 className="text-lg font-semibold tracking-tight">Settings</h2>
        </div>
        <nav className="flex flex-col space-y-8">
          {navItems.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        isActive ? "bg-primary/10 text-primary border-l-2 border-primary rounded-l-none" : "transparent"
                      )}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.title}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex-1 lg:max-w-4xl">{children}</div>
    </div>
  )
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  FlaskConical,
  BarChart3,
  Shield,
  Settings,
  CreditCard,
  LogOut,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { ContributorBadge } from '../inventory/contributor-badge';

const sidebarLinks = [
  { group: 'MAIN', items: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'POS Billing', href: '/dashboard/pos', icon: ShoppingCart, highlight: true },
  ]},
  { group: 'MANAGEMENT', items: [
    { name: 'Inventory', href: '/dashboard/inventory', icon: Package, badge: 0 },
    { name: 'My Submissions', href: '/dashboard/inventory/submissions', icon: FlaskConical, badge: 0 },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Suppliers', href: '/dashboard/suppliers', icon: Truck },
  ]},
  { group: 'ANALYTICS', items: [
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'Audit Log', href: '/dashboard/audit', icon: Shield },
  ]},
  { group: 'SETTINGS', items: [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Billing', href: '/dashboard/settings/billing', icon: CreditCard },
  ]},
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    if (!user?.tenant?.id) return;

    async function fetchPendingCount() {
      const { count } = await supabase
        .from('medicines')
        .select('*', { count: 'exact', head: true })
        .eq('submitted_by', user?.tenant?.id)
        .eq('scope', 'pending_review');

      setPendingCount(count || 0);
    }

    fetchPendingCount();

    // Subscribe to changes
    const channel = supabase
      .channel('pending-submissions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'medicines',
        filter: `submitted_by=eq.${user.tenant.id}`
      }, () => fetchPendingCount())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.tenant?.id, supabase]);

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-slate-800 shrink-0">
      <div className="p-6 flex flex-col gap-1">
        <Logo className="w-32 h-auto" />
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              {user?.tenant?.name || 'Loading Store...'}
            </span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 capitalize">
              {user?.tenant?.plan || 'Starter'}
            </Badge>
          </div>
          {user?.tenant?.id && (
            <ContributorBadgeWrapper tenantId={user.tenant.id} />
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 overflow-y-auto space-y-6 scrollbar-hide">
        {sidebarLinks.map((group) => (
          <div key={group.group} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {group.group}
            </h4>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                const badge = item.name === 'My Submissions' ? pendingCount : item.badge;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary border-l-[3px] border-primary rounded-l-none font-medium"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
                      item.highlight && !isActive && "text-sky-600 dark:text-sky-400 font-semibold"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300")} />
                    <span className="text-sm">{item.name}</span>
                    {badge !== undefined && badge > 0 && (
                      <span className="ml-auto bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-tighter font-bold">{user?.role || 'Pharmacist'}</p>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 h-8 w-8">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/10 px-3 h-9"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}

function ContributorBadgeWrapper({ tenantId }: { tenantId: string }) {
  const [stats, setStats] = useState<{ count: number; isContributor: boolean } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase
        .from('store_settings')
        .select('contributor_count, is_contributor')
        .eq('tenant_id', tenantId)
        .single();

      if (data) {
        setStats({ count: data.contributor_count, isContributor: data.is_contributor });
      }
    }

    fetchStats();
  }, [tenantId, supabase]);

  if (!stats?.isContributor) return null;

  return <ContributorBadge contributorCount={stats.count} isContributor={true} size="sm" />;
}

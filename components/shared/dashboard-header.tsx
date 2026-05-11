'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Menu,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export function DashboardHeader() {
  const [search, setSearch] = useState('');
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Handle global search (inventory mode)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/dashboard/inventory?search=${encodeURIComponent(search.trim())}`);
    }
  };

  // Dynamic page title based on path
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return 'Dashboard Overview';
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>

        <div className="hidden lg:flex flex-col">
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {getPageTitle()}
          </h1>
          <div className="flex items-center text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">
            <span>MedPOS</span>
            <ChevronRight className="w-3 h-3 mx-1" />
            <span className="text-primary">{getPageTitle()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6 flex-1 max-w-xl justify-center px-4">
        <form onSubmit={handleSearch} className="relative w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search medicines in your inventory..."
            className="pl-10 h-10 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 w-full focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="py-2 text-center text-sm text-slate-500">
              No new notifications
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary font-medium cursor-pointer">
              View All Notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0.5 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-primary transition-all">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold overflow-hidden">
                <User className="w-5 h-5" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-slate-500">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// components/audit/audit-filters.tsx

'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/use-debounce'

interface AuditFiltersProps {
  actionTypes: string[]
  users: { id: string, name: string }[]
  getActionDescription: (action: string) => string
}

export function AuditFilters({ actionTypes, users, getActionDescription }: AuditFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const debouncedSearch = useDebounce(search, 500)

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    updateFilters('q', debouncedSearch)
  }, [debouncedSearch])

  return (
    <>
      <Select
        defaultValue={searchParams.get('action') || "all"}
        onValueChange={(val) => updateFilters('action', val)}
      >
        <SelectTrigger className="w-[180px] h-10">
           <SelectValue placeholder="All Actions" />
        </SelectTrigger>
        <SelectContent>
           <SelectItem value="all">All Actions</SelectItem>
           {actionTypes.map(type => (
               <SelectItem key={type} value={type}>{getActionDescription(type)}</SelectItem>
           ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get('userId') || "all"}
        onValueChange={(val) => updateFilters('userId', val)}
      >
        <SelectTrigger className="w-[180px] h-10">
           <SelectValue placeholder="All Users" />
        </SelectTrigger>
        <SelectContent>
           <SelectItem value="all">All Users</SelectItem>
           {users.map(user => (
               <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
           ))}
        </SelectContent>
      </Select>

      <div className="relative flex-1 min-w-[200px]">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
         <input
           type="text"
           placeholder="Search description..."
           className="w-full h-10 pl-10 pr-4 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
           value={search}
           onChange={(e) => setSearch(e.target.value)}
         />
      </div>
    </>
  )
}

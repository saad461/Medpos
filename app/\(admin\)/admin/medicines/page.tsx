import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ShieldAlert,
  Database,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function GlobalMedicinesPage({
  searchParams
}: {
  searchParams: { q?: string }
}) {
  const supabase = await createClient(true)

  let query = supabase
    .from('medicines')
    .select('*')
    .eq('scope', 'global')
    .order('name', { ascending: true })

  if (searchParams.q) {
    query = query.ilike('name', `%${searchParams.q}%`)
  }

  const { data: medicines } = await query

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <Database className="h-8 w-8 text-accent" />
             Global Medicine DB
          </h2>
          <p className="text-white/40">Manage the shared Pakistan medicine reference database</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 font-bold h-11 gap-2 shadow-lg shadow-accent/10">
           <Plus className="h-4 w-4" />
           Add Medicine
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <DBStat label="Total Medicines" value={medicines?.length || 0} />
         <DBStat label="Last DRAP Sync" value="May 01, 2026" />
         <DBStat label="Sync Frequency" value="Monthly" />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input
            placeholder="Search by name, generic, or company..."
            className="bg-[#1E293B] border-white/5 pl-10 h-11 text-white focus-visible:ring-accent"
          />
        </div>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 h-11 px-6">
           <Filter className="h-4 w-4 mr-2" />
           Filters
        </Button>
      </div>

      <div className="bg-[#1E293B] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] uppercase font-bold text-white/40 tracking-widest py-5">Medicine</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Generic / Category</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Company</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-white/40 tracking-widest text-center">DRAP MRP</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-white/40 tracking-widest text-center">Flags</TableHead>
              <TableHead className="text-right text-[10px] uppercase font-bold text-white/40 tracking-widest pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicines?.map((med) => (
              <TableRow key={med.id} className="border-white/5 hover:bg-white/[0.01] transition-colors">
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{med.name}</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-tighter">{med.unit}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm text-white/80">{med.generic_name}</span>
                    <span className="text-[10px] text-accent uppercase font-bold tracking-tight">{med.category}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-white/60 font-medium">{med.company}</TableCell>
                <TableCell className="text-center">
                  <span className="font-mono text-sm text-white/80 font-bold">Rs. {med.drap_mrp}</span>
                </TableCell>
                <TableCell className="text-center">
                  {med.is_controlled && (
                    <Badge className="bg-danger/20 text-danger border-danger/20 uppercase text-[9px] font-bold">
                       Controlled
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5">
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-danger hover:bg-danger/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function DBStat({ label, value }: { label: string, value: any }) {
  return (
    <div className="bg-[#1E293B] p-5 rounded-xl border border-white/5">
       <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">{label}</p>
       <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

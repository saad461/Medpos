import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FlaskConical, Store, Calendar, Check, X, Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function PendingMedicinesPage() {
  const supabase = await createClient(true)

  const { data: pending } = await supabase
    .from('medicines')
    .select(`
      *,
      tenants (
        name,
        owner_email
      )
    `)
    .eq('scope', 'pending_review')
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
           <FlaskConical className="h-8 w-8 text-purple-400" />
           Pending Submissions
        </h2>
        <p className="text-white/40">Review medicines submitted by store owners for global inclusion</p>
      </div>

      {!pending || pending.length === 0 ? (
        <div className="bg-[#1E293B] rounded-3xl p-16 text-center border border-white/5 space-y-4">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-success" />
          </div>
          <h3 className="text-2xl font-bold text-white">Queue Empty</h3>
          <p className="text-white/40 max-w-md mx-auto">
            No medicine submissions waiting for review. All caught up!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pending.map((med) => (
            <Card key={med.id} className="bg-[#1E293B] border-white/5 overflow-hidden">
               <CardHeader className="bg-white/[0.02] border-b border-white/5">
                  <div className="flex items-start justify-between">
                     <div className="space-y-1">
                        <CardTitle className="text-xl font-bold text-white">{med.name}</CardTitle>
                        <p className="text-xs font-bold text-accent uppercase tracking-widest">{med.generic_name}</p>
                     </div>
                     <Badge variant="outline" className="border-white/10 text-white/40">{med.unit}</Badge>
                  </div>
               </CardHeader>
               <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <MedDetail label="Category" value={med.category} />
                     <MedDetail label="Company" value={med.company} />
                     <MedDetail label="DRAP MRP" value={`Rs. ${med.drap_mrp}`} />
                     <MedDetail label="Controlled" value={med.is_controlled ? 'Yes' : 'No'} />
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 space-y-3">
                     <div className="flex items-center gap-3 text-xs text-white/60">
                        <Store className="h-3.5 w-3.5 opacity-50" />
                        <span>Submitted by: <strong>{(med as any).tenants?.name}</strong></span>
                     </div>
                     <div className="flex items-center gap-3 text-xs text-white/60">
                        <Calendar className="h-3.5 w-3.5 opacity-50" />
                        <span>Date: {new Date(med.created_at).toLocaleDateString()}</span>
                     </div>
                  </div>
               </CardContent>
               <CardFooter className="bg-white/[0.02] border-t border-white/5 p-4 grid grid-cols-3 gap-2">
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 h-9 text-xs font-bold gap-2">
                     <Edit3 className="h-3 w-3" />
                     Edit
                  </Button>
                  <Button variant="outline" className="border-danger/20 text-danger hover:bg-danger/10 h-9 text-xs font-bold gap-2">
                     <X className="h-3 w-3" />
                     Reject
                  </Button>
                  <Button className="bg-success hover:bg-success/90 text-white h-9 text-xs font-bold gap-2">
                     <Check className="h-3 w-3" />
                     Approve
                  </Button>
               </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function MedDetail({ label, value }: { label: string, value: any }) {
  return (
    <div className="space-y-0.5">
       <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">{label}</p>
       <p className="text-sm font-bold text-white/80">{value || 'N/A'}</p>
    </div>
  )
}

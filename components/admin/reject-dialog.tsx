'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { rejectTenant } from "@/lib/admin/actions"
import { toast } from "sonner"
import { Loader2, AlertTriangle } from "lucide-react"

interface RejectDialogProps {
  tenantId: string
  storeName: string
  ownerEmail: string
  trigger?: React.ReactNode
}

export function RejectDialog({ tenantId, storeName, ownerEmail, trigger }: RejectDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('Duplicate account')
  const [customReason, setCustomReason] = useState('')
  const [refundConfirmed, setRefundConfirmed] = useState(false)

  const handleReject = async () => {
    setLoading(true)
    const finalReason = reason === 'Other' ? customReason : reason
    try {
      await rejectTenant(tenantId, finalReason, refundConfirmed)
      toast.success(`${storeName} rejected.`)
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to reject")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" className="border-danger text-danger hover:bg-danger/10 font-bold h-9">Reject</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1E293B] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-danger">
            <AlertTriangle className="h-5 w-5" />
            Reject Subscription
          </DialogTitle>
          <DialogDescription className="text-white/60 pt-2">
            This will notify <strong>{storeName}</strong> and cancel their subscription.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Reason for Rejection</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
              {[
                'Duplicate account',
                'Suspicious payment',
                'Incomplete information',
                'Policy violation',
                'Other'
              ].map((r) => (
                <div key={r} className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                  <RadioGroupItem value={r} id={r} className="border-white/20 text-danger" />
                  <Label htmlFor={r} className="text-sm font-medium cursor-pointer flex-1">{r}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {reason === 'Other' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
              <Label className="text-xs font-bold text-white/40 uppercase">Specify Reason</Label>
              <Textarea
                className="bg-white/5 border-white/10"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-start space-x-3 p-4 bg-danger/10 border border-danger/20 rounded-xl">
             <Checkbox
                id="refund"
                checked={refundConfirmed}
                onCheckedChange={(checked) => setRefundConfirmed(checked as boolean)}
                className="mt-1 border-danger/50 data-[state=checked]:bg-danger"
             />
             <div className="space-y-1">
               <Label htmlFor="refund" className="text-sm font-bold text-danger leading-none">Refund Issued</Label>
               <p className="text-xs text-danger/70 leading-tight">
                 I confirm that I have manually issued a refund via the Safepay dashboard for this transaction.
               </p>
             </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="hover:bg-white/5 text-white/60">Cancel</Button>
          <Button
            variant="destructive"
            disabled={loading || !refundConfirmed}
            onClick={handleReject}
            className="font-bold px-6"
          >
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Reject & Notify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

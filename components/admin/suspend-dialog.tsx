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
import { suspendTenant, reactivateTenant } from "@/lib/admin/actions"
import { toast } from "sonner"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"

interface SuspendDialogProps {
  tenantId: string
  storeName: string
  currentStatus: string
  trigger?: React.ReactNode
}

export function SuspendDialog({ tenantId, storeName, currentStatus, trigger }: SuspendDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('Payment overdue')
  const [customReason, setCustomReason] = useState('')
  const [notifyOwner, setNotifyOwner] = useState(true)
  const [message, setMessage] = useState('')

  const isSuspended = currentStatus === 'suspended'

  const handleAction = async () => {
    setLoading(true)
    try {
      if (isSuspended) {
        await reactivateTenant(tenantId)
        toast.success(`${storeName} reactivated successfully!`)
      } else {
        const finalReason = reason === 'Other' ? customReason : reason
        await suspendTenant(tenantId, finalReason, notifyOwner, message)
        toast.success(`${storeName} suspended.`)
      }
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Action failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant={isSuspended ? "default" : "outline"}
            className={isSuspended ? "bg-success hover:bg-success/90" : "border-danger text-danger hover:bg-danger/10"}
          >
            {isSuspended ? 'Reactivate' : 'Suspend'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1E293B] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className={isSuspended ? "text-success" : "text-danger"}>
            {isSuspended ? 'Reactivate Account' : 'Suspend Account'}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {isSuspended
              ? `Restore access for ${storeName}. They will be able to log in immediately.`
              : `Disable access for ${storeName}. They will see the suspended page when logging in.`
            }
          </DialogDescription>
        </DialogHeader>

        {!isSuspended && (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Reason for Suspension</Label>
              <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
                {['Payment overdue', 'Terms violation', 'Fraudulent activity', 'Owner request', 'Other'].map((r) => (
                  <div key={r} className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/5">
                    <RadioGroupItem value={r} id={r} className="border-white/20 text-danger" />
                    <Label htmlFor={r} className="text-sm cursor-pointer flex-1">{r}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
               <div className="flex items-center space-x-2">
                 <Checkbox
                    id="notify"
                    checked={notifyOwner}
                    onCheckedChange={(c) => setNotifyOwner(c as boolean)}
                    className="border-white/20 data-[state=checked]:bg-accent"
                 />
                 <Label htmlFor="notify" className="text-sm font-medium">Notify store owner via email</Label>
               </div>
               {notifyOwner && (
                 <Textarea
                   placeholder="Personal note for owner..."
                   className="bg-white/5 border-white/10 min-h-[80px]"
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                 />
               )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="text-white/60">Cancel</Button>
          <Button
            variant={isSuspended ? "default" : "destructive"}
            className="font-bold px-6"
            onClick={handleAction}
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {isSuspended ? 'Confirm Reactivation' : 'Confirm Suspension'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

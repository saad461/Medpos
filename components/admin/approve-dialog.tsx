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
import { approveTenant } from "@/lib/admin/actions"
import { toast } from "sonner"
import { Loader2, CheckCircle2 } from "lucide-react"

interface ApproveDialogProps {
  tenantId: string
  storeName: string
  ownerEmail: string
  trigger?: React.ReactNode
}

export function ApproveDialog({ tenantId, storeName, ownerEmail, trigger }: ApproveDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleApprove = async () => {
    setLoading(true)
    try {
      await approveTenant(tenantId, message)
      toast.success(`${storeName} approved successfully!`)
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to approve store")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="bg-success hover:bg-success/90 text-white font-bold h-9">Approve</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1E293B] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Approve Subscription
          </DialogTitle>
          <DialogDescription className="text-white/60 pt-2">
            You are about to activate <strong>{storeName}</strong>. The owner ({ownerEmail}) will be notified and granted access immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message" className="text-xs font-bold text-white/40 uppercase tracking-widest">
              Personal message (optional)
            </Label>
            <Textarea
              id="message"
              placeholder="e.g. Welcome to MedPOS! Let us know if you need help."
              className="bg-white/5 border-white/10 focus-visible:ring-success min-h-[100px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="bg-success/10 border border-success/20 rounded-lg p-3 space-y-2">
            <p className="text-[10px] font-bold text-success uppercase tracking-widest">Automated Actions:</p>
            <ul className="text-xs text-success/80 space-y-1">
              <li>• Tenant status set to active</li>
              <li>• Welcome email with login details sent</li>
              <li>• Access to dashboard enabled</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="hover:bg-white/5 text-white/60">
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={loading}
            className="bg-success hover:bg-success/90 text-white font-bold px-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              'Approve & Notify'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

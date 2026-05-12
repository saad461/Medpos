'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RemoveUserDialogProps {
  user: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function RemoveUserDialog({ user, isOpen, onOpenChange }: RemoveUserDialogProps) {
  const router = useRouter()
  const [confirmName, setConfirmName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRemove = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/settings/users/${user.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove')

      toast.success(`${user.name} removed from your store`)
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to remove team member.')
    } finally {
      setIsLoading(false)
    }
  }

  const isConfirmed = confirmName === user.name

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Team Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <span className="font-bold text-foreground">{user.name}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-bold">Important Information:</p>
              <ul className="list-disc list-inside space-y-1 opacity-90">
                <li>They will lose access to the store immediately.</li>
                <li>Past sales records and audit logs are preserved.</li>
                <li>They will NOT receive an email notification.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-name" className="text-sm">
              Type <span className="font-bold">{user.name}</span> to confirm
            </Label>
            <Input
              id="confirm-name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={user.name}
              className="border-destructive/20 focus-visible:ring-destructive"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isLoading || !isConfirmed}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Remove Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

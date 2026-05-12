'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { RoleBadge } from './role-badge'

interface ChangeRoleDialogProps {
  user: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangeRoleDialog({ user, isOpen, onOpenChange }: ChangeRoleDialogProps) {
  const router = useRouter()
  const [role, setRole] = useState(user.role)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/settings/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) throw new Error('Failed to update')

      toast.success(`${user.name}'s role updated to ${role}`)
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to update user role.')
    } finally {
      setIsLoading(false)
    }
  }

  const isDemoting = (user.role === 'admin' && (role === 'pharmacist' || role === 'cashier'))

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role — {user.name}</DialogTitle>
          <DialogDescription>
            Update the access level for this team member.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            Current Role: <RoleBadge role={user.role} />
          </div>

          <RadioGroup value={role} onValueChange={setRole} className="grid gap-4">
            <div className="flex items-start space-x-3 space-y-0 rounded-md border p-3">
              <RadioGroupItem value="admin" id="role-admin" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="role-admin" className="font-semibold">Admin</Label>
                <p className="text-xs text-muted-foreground">
                  Full access except billing. Can manage medicines, sales, and team.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 space-y-0 rounded-md border p-3">
              <RadioGroupItem value="pharmacist" id="role-pharmacist" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="role-pharmacist" className="font-semibold">Pharmacist</Label>
                <p className="text-xs text-muted-foreground">
                  Can view inventory and customers. Cannot make sales or change prices.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 space-y-0 rounded-md border p-3">
              <RadioGroupItem value="cashier" id="role-cashier" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="role-cashier" className="font-semibold">Cashier</Label>
                <p className="text-xs text-muted-foreground">
                  Can make sales at POS. Limited privileges. Cannot view reports.
                </p>
              </div>
            </div>
          </RadioGroup>

          {isDemoting && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-warning">
                Demoting {user.name} will immediately restrict their access.
                They may need to sign in again to reflect changes.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading || role === user.role}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

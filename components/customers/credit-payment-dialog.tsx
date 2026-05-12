'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatPKR } from '@/lib/utils'
import { recordCreditPayment } from '@/lib/customers/actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface CreditPaymentDialogProps {
  customerId: string
  customerName: string
  currentBalance: number
  trigger?: React.ReactNode
}

export function CreditPaymentDialog({ customerId, customerName, currentBalance, trigger }: CreditPaymentDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [amount, setAmount] = React.useState('')
  const [method, setMethod] = React.useState('cash')
  const [ref, setRef] = React.useState('')
  const [notes, setNotes] = React.useState('')

  const handleQuickPay = (type: 'full' | 'half') => {
    if (type === 'full') setAmount(currentBalance.toString())
    if (type === 'half') setAmount((currentBalance / 2).toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return toast.error('Please enter a valid amount')
    }

    try {
      setLoading(true)
      await recordCreditPayment(customerId, {
        amount: Number(amount),
        payment_method: method,
        reference_no: ref,
        notes: notes
      })
      toast.success('Payment recorded successfully')
      setOpen(false)
      // Reset form
      setAmount('')
      setRef('')
      setNotes('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  const newBalance = currentBalance - (Number(amount) || 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button size="sm">Record Payment</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Payment — {customerName}</DialogTitle>
            <DialogDescription>
              Record a cash or bank payment to settle outstanding credit.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="bg-slate-50 p-3 rounded-lg border flex justify-between items-center">
              <span className="text-sm font-medium">Outstanding Balance:</span>
              <span className="text-lg font-bold text-amber-600">{formatPKR(currentBalance)}</span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount Received</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <Button type="button" variant="outline" size="sm" onClick={() => handleQuickPay('full')}>Full</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleQuickPay('half')}>Half</Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                  <SelectItem value="jazzcash">JazzCash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ref">Reference Number (Optional)</Label>
              <Input id="ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Transaction ID" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="pt-2 border-t mt-2">
              <p className="text-xs text-muted-foreground text-center">
                New balance after payment: <span className="font-bold text-primary">{formatPKR(newBalance)}</span>
                {newBalance < 0 && <span className="block text-blue-600">(Rs. {Math.abs(newBalance)} will be added as advance credit)</span>}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

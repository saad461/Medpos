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
import { Checkbox } from '@/components/ui/checkbox'
import { receiveStock } from '@/lib/suppliers/actions'
import { toast } from 'sonner'
import { Loader2, PackageCheck } from 'lucide-react'
import { formatPKR } from '@/lib/utils'

interface ReceiveStockDialogProps {
  po: any
  items: any[]
}

export function ReceiveStockDialog({ po, items }: ReceiveStockDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [receivedItems, setReceivedItems] = React.useState<any[]>(
    items.map(item => ({
      id: item.id,
      store_medicine_id: item.store_medicine_id,
      medicine_name: item.medicine_name,
      ordered_qty: item.qty,
      already_received: item.qty_received || 0,
      qty_received: (item.qty - (item.qty_received || 0)),
      unit_price: item.unit_price,
      expiry_date: '',
      active: (item.qty - (item.qty_received || 0)) > 0
    }))
  )
  const [invoiceNo, setInvoiceNo] = React.useState('')
  const [isPartial, setIsPartial] = React.useState(false)

  const updateItem = (id: string, field: string, value: any) => {
    setReceivedItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const itemsToSubmit = receivedItems.filter(i => i.active && i.qty_received > 0)
    if (itemsToSubmit.length === 0) return toast.error('Please select at least one item to receive')

    // Validate expiry dates
    if (itemsToSubmit.some(i => !i.expiry_date)) {
      return toast.error('Expiry date is required for all received items')
    }

    try {
      setLoading(true)
      await receiveStock(po.id, {
        items: itemsToSubmit,
        invoice_no: invoiceNo,
        is_partial: isPartial
      })
      toast.success('Stock received successfully')
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to receive stock')
    } finally {
      setLoading(false)
    }
  }

  const totalValue = receivedItems
    .filter(i => i.active)
    .reduce((sum, i) => sum + (i.qty_received * i.unit_price), 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <PackageCheck className="mr-2 h-4 w-4" />
          Receive Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>Receive Stock — {po.po_number}</DialogTitle>
            <DialogDescription>
              Mark items as received and update your inventory stock levels.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Supplier Invoice Number</Label>
              <Input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="e.g. INV-12345" />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="partial"
                checked={isPartial}
                onCheckedChange={(checked) => setIsPartial(!!checked)}
              />
              <Label htmlFor="partial" className="cursor-pointer">This is a partial delivery</Label>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-bottom">
                <tr>
                  <th className="px-4 py-2 text-left w-10"></th>
                  <th className="px-4 py-2 text-left">Medicine</th>
                  <th className="px-4 py-2 text-center w-24">Ordered</th>
                  <th className="px-4 py-2 text-center w-24">Received</th>
                  <th className="px-4 py-2 text-center w-32">Unit Price</th>
                  <th className="px-4 py-2 text-left w-40">Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {receivedItems.map((item) => (
                  <tr key={item.id} className={`border-t ${!item.active ? 'opacity-40' : ''}`}>
                    <td className="px-4 py-2">
                      <Checkbox
                        checked={item.active}
                        onCheckedChange={(checked) => updateItem(item.id, 'active', !!checked)}
                        disabled={(item.ordered_qty - item.already_received) <= 0}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-bold">{item.medicine_name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        {item.already_received > 0 && `Already received: ${item.already_received}`}
                      </p>
                    </td>
                    <td className="px-4 py-2 text-center">{item.ordered_qty}</td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        className="h-8 text-center"
                        value={item.qty_received}
                        onChange={(e) => updateItem(item.id, 'qty_received', Number(e.target.value))}
                        disabled={!item.active}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        className="h-8 text-center"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, 'unit_price', Number(e.target.value))}
                        disabled={!item.active}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="date"
                        className="h-8"
                        value={item.expiry_date}
                        onChange={(e) => updateItem(item.id, 'expiry_date', e.target.value)}
                        disabled={!item.active}
                        required={item.active}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border">
            <span className="font-medium text-slate-600">Total Value of Received Stock:</span>
            <span className="text-2xl font-bold text-emerald-600">{formatPKR(totalValue)}</span>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading || receivedItems.filter(i => i.active).length === 0} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Receipt & Update Inventory
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

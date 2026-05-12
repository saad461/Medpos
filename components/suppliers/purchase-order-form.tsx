'use client'

import React from 'react'
import { Plus, Search, ShoppingCart, Trash2, Info, Mail, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createPurchaseOrder } from '@/lib/suppliers/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { formatPKR } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface POFormProps {
  suppliers: any[]
  medicines: any[]
  initialSupplierId?: string
}

export function PurchaseOrderForm({ suppliers, medicines, initialSupplierId }: POFormProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [selectedSupplierId, setSelectedSupplierId] = React.useState(initialSupplierId || '')
  const [search, setSearch] = React.useState('')
  const [items, setItems] = React.useState<any[]>([])
  const [notes, setNotes] = React.useState('')
  const [expectedDate, setExpectedDate] = React.useState('')

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId)

  const filteredMeds = medicines.filter(m =>
    m.medicines.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10)

  const lowStockMeds = medicines.filter(m => m.stock_qty <= m.reorder_level)

  const addItem = (med: any) => {
    const existing = items.find(i => i.store_medicine_id === med.id)
    if (existing) return

    const suggestedQty = Math.max(0, med.reorder_level - med.stock_qty) + Math.ceil(med.reorder_level * 0.5)

    setItems([...items, {
      store_medicine_id: med.id,
      medicine_name: med.medicines.name,
      qty: suggestedQty || 10,
      unit_price: Number(med.purchase_price) || 0
    }])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.store_medicine_id !== id))
  }

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(i => i.store_medicine_id === id ? { ...i, [field]: value } : i))
  }

  const totalAmount = items.reduce((sum, i) => sum + (i.qty * i.unit_price), 0)

  const handleSubmit = async (sendEmail: boolean) => {
    if (!selectedSupplierId) return toast.error('Please select a supplier')
    if (items.length === 0) return toast.error('Please add at least one item')

    try {
      setLoading(true)
      await createPurchaseOrder({
        supplier_id: selectedSupplierId,
        items,
        notes,
        expected_delivery: expectedDate,
        send_email: sendEmail
      })
      toast.success(sendEmail ? 'PO created and sent to supplier' : 'PO saved as draft')
      router.push('/suppliers/purchase-orders')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create PO')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Medicine Selection */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.city})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSupplier && !selectedSupplier.email && (
              <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                <Info className="h-3 w-3" /> Supplier has no email. Manual PDF download enabled.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Medicines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              {search && filteredMeds.map(med => (
                <div key={med.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-slate-50">
                  <div>
                    <p className="font-bold text-sm">{med.medicines.name}</p>
                    <p className="text-xs text-muted-foreground">Stock: {med.stock_qty} | Reorder: {med.reorder_level}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => addItem(med)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {!search && lowStockMeds.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Low Stock Suggestions</p>
                  {lowStockMeds.slice(0, 5).map(med => (
                    <div key={med.id} className="flex items-center justify-between p-2 border border-amber-100 bg-amber-50/30 rounded-lg">
                      <div>
                        <p className="font-bold text-sm">{med.medicines.name}</p>
                        <p className="text-xs text-muted-foreground">Stock: {med.stock_qty} / {med.reorder_level}</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => addItem(med)}>
                        Add Suggested
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: PO Items */}
      <div className="space-y-6">
        <Card className="min-h-[600px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Order Summary</CardTitle>
            <Badge variant="outline">{items.length} Items</Badge>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.store_medicine_id} className="p-3 border rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-sm">{item.medicine_name}</p>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => removeItem(item.store_medicine_id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground uppercase">Quantity</Label>
                      <Input
                        type="number"
                        className="h-8"
                        value={item.qty}
                        onChange={(e) => updateItem(item.store_medicine_id, 'qty', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground uppercase">Unit Price</Label>
                      <Input
                        type="number"
                        className="h-8"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.store_medicine_id, 'unit_price', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm italic">No items added yet</p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase">Expected Date</Label>
                  <Input type="date" className="h-8" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase">Notes</Label>
                  <Input className="h-8" placeholder="Reference..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold text-primary">{formatPKR(totalAmount)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" disabled={loading} onClick={() => handleSubmit(false)}>
                  Save as Draft
                </Button>
                {selectedSupplier?.email ? (
                  <Button disabled={loading} onClick={() => handleSubmit(true)}>
                    <Mail className="mr-2 h-4 w-4" /> Send to Supplier
                  </Button>
                ) : (
                  <Button variant="secondary" disabled={loading} onClick={() => handleSubmit(false)}>
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`block font-semibold ${className}`}>{children}</span>
}

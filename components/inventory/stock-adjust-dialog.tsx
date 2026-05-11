'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, Hash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function StockAdjustDialog({
  open,
  onOpenChange,
  item,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  onSuccess?: () => void;
}) {
  const [mode, setMode] = useState<'add' | 'remove' | 'set'>('add');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('received_stock');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const newStock = mode === 'add' ? item.stock_qty + quantity : mode === 'remove' ? Math.max(0, item.stock_qty - quantity) : quantity;

  const handleAdjust = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/inventory/adjust-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_medicine_id: item.id,
          adjustment_type: mode,
          quantity: quantity,
          reason,
          notes
        }),
      });
      if (res.ok) {
        toast.success('Stock adjusted successfully');
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error('Failed to adjust stock');
      }
     } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock — {item?.medicine.name}</DialogTitle>
          <DialogDescription>
            Record changes to the physical stock level. Current stock: <span className="font-bold text-slate-900">{item?.stock_qty} units</span>.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v: any) => {
          setMode(v);
          if (v === 'add') setReason('received_stock');
          else if (v === 'remove') setReason('damaged');
          else setReason('counted');
        }}>
          <TabsList className="grid grid-cols-3 w-full h-10 mb-6">
            <TabsTrigger value="add" className="gap-2">
              <Plus className="w-3 h-3" /> Add
            </TabsTrigger>
            <TabsTrigger value="remove" className="gap-2">
              <Minus className="w-3 h-3" /> Remove
            </TabsTrigger>
            <TabsTrigger value="set" className="gap-2">
              <Hash className="w-3 h-3" /> Set Exact
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">
                {mode === 'set' ? 'New Total Quantity' : 'Quantity to ' + (mode === 'add' ? 'Add' : 'Remove')}
              </Label>
              <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {mode === 'add' && <SelectItem value="received_stock">Received new stock</SelectItem>}
                  {mode === 'remove' && (
                    <>
                      <SelectItem value="damaged">Damaged / Expired</SelectItem>
                      <SelectItem value="disposed">Disposed / Thrown out</SelectItem>
                      <SelectItem value="returned_to_supplier">Returned to supplier</SelectItem>
                    </>
                  )}
                  {mode === 'set' && <SelectItem value="counted">Physical count / correction</SelectItem>}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Notes (Optional)</Label>
              <Textarea placeholder="e.g. Batch #456 received" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">New Stock will be:</span>
              <span className="text-2xl font-black text-primary">{newStock} units</span>
            </div>
          </div>
        </Tabs>

        <DialogFooter className="pt-4 border-t gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdjust} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
            Confirm Adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Check } from 'lucide-react';

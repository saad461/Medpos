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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Loader2, CheckCircle2, ArrowLeftRight, History } from 'lucide-react';
import { format } from 'date-fns';
import { formatPKR } from '@/lib/utils';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function ReturnSaleDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState(1);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [sale, setSale] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, { qty: number, selected: boolean }>>({});
  const [returnReason, setReturnReason] = useState('wrong_medicine');
  const [refundMethod, setRefundMethod] = useState('cash');
  const [submitting, setSubmitting] = useState(false);

  const findSale = async () => {
    if (!invoiceNo) return;
    setLoading(true);
    try {
      // Find sale by invoice number - would need a specific endpoint or filter the list
      const res = await fetch(`/api/sales?search=${invoiceNo}`);
      const data = await res.json() as { data: { id: string }[] };
      if (data.data && data.data.length > 0) {
        const fullSaleRes = await fetch(`/api/sales/${data.data[0].id}`);
        const fullSale = await fullSaleRes.json() as { items: { id: string, qty: number }[] };
        setSale(fullSale);

        const initialSelected: Record<string, { qty: number, selected: boolean }> = {};
        fullSale.items.forEach((item) => {
          initialSelected[item.id] = { qty: item.qty, selected: false };
        });
        setSelectedItems(initialSelected);
        setStep(2);
      } else {
        toast.error('Sale not found');
      }
    } catch {
      toast.error('Error finding sale');
    } finally {
      setLoading(false);
    }
  };

  const calculateRefundAmount = () => {
    if (!sale) return 0;
    return Object.entries(selectedItems).reduce((sum, [id, itemData]) => {
      if (itemData.selected) {
        const item = (sale.items as { id: string, unit_price: number }[]).find((i) => i.id === id);
        return sum + ((item?.unit_price || 0) * itemData.qty);
      }
      return sum;
    }, 0);
  };

  const handleProcessReturn = async () => {
    setSubmitting(true);
    try {
      const itemsToReturn = Object.entries(selectedItems)
        .filter(([_, data]) => data.selected)
        .map(([id, data]) => ({
          sale_item_id: id,
          qty: data.qty
        }));

      const res = await fetch('/api/sales/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_sale_id: sale.id,
          items: itemsToReturn,
          reason: returnReason,
          refund_method: refundMethod
        }),
      });

      if (res.ok) {
        toast.success('Return processed successfully');
        onOpenChange(false);
      } else {
        const err = await res.json() as { error?: string };
        toast.error(err.error || 'Failed to process return');
      }
    } catch {
      toast.error('Processing error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Process Return / Refund
          </DialogTitle>
          <DialogDescription>
            Find a sale by invoice number to start the return process.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label>Invoice Number</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="INV-20240511-00001"
                    className="pl-9"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && findSale()}
                  />
                </div>
                <Button onClick={findSale} disabled={loading || !invoiceNo}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find Sale'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && sale && (
          <div className="py-4 space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original Sale</p>
                <p className="font-bold text-slate-900">{sale.invoice_no}</p>
                <p className="text-xs text-slate-500">{format(new Date(sale.created_at), 'MMM d, yyyy')}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                <p className="font-black text-primary">{formatPKR(sale.total)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Items to Return</Label>
              <div className="border rounded-xl divide-y overflow-hidden">
                {sale.items.map((item: any) => (
                  <div key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedItems[item.id]?.selected}
                        onCheckedChange={(checked) => setSelectedItems(prev => ({
                          ...prev,
                          [item.id]: { ...prev[item.id], selected: !!checked }
                        }))}
                      />
                      <div>
                        <p className="text-sm font-bold">{item.medicine_name}</p>
                        <p className="text-[10px] text-slate-500">{item.qty} units sold at {formatPKR(item.unit_price)}</p>
                      </div>
                    </div>
                    {selectedItems[item.id]?.selected && (
                      <div className="flex items-center gap-2">
                        <Label className="text-[10px] font-bold">Qty:</Label>
                        <Input
                          type="number"
                          className="h-8 w-16 text-center"
                          min="1"
                          max={item.qty}
                          value={selectedItems[item.id].qty}
                          onChange={(e) => setSelectedItems(prev => ({
                            ...prev,
                            [item.id]: { ...prev[item.id], qty: Math.min(item.qty, Number(e.target.value)) }
                          }))}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Return Reason</Label>
                <RadioGroup value={returnReason} onValueChange={setReturnReason} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wrong_medicine" id="r1" />
                    <Label htmlFor="r1" className="text-xs">Wrong Medicine</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="damaged" id="r2" />
                    <Label htmlFor="r2" className="text-xs">Damaged / Expired</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="customer_changed_mind" id="r3" />
                    <Label htmlFor="r3" className="text-xs">Changed Mind</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Refund Method</Label>
                <RadioGroup value={refundMethod} onValueChange={setRefundMethod} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="m1" />
                    <Label htmlFor="m1" className="text-xs">Cash Refund</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit" id="m2" />
                    <Label htmlFor="m2" className="text-xs">Store Credit</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700 uppercase tracking-tight">Total Refund</span>
              </div>
              <span className="text-2xl font-black text-emerald-700">{formatPKR(calculateRefundAmount())}</span>
            </div>
          </div>
        )}

        <DialogFooter className="border-t pt-4 gap-2">
          <Button variant="outline" onClick={() => { if(step === 2) setStep(1); else onOpenChange(false); }}>
            {step === 2 ? 'Back' : 'Cancel'}
          </Button>
          {step === 2 && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 font-bold"
              disabled={submitting || calculateRefundAmount() === 0}
              onClick={handleProcessReturn}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowLeftRight className="w-4 h-4 mr-2" />}
              Process Refund
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

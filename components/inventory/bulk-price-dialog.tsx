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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { IndianRupee, Percent, Save, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function BulkPriceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [scope, setScope] = useState('all');
  const [type, setType] = useState('increase_pct');
  const [value, setValue] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleBulkUpdate = async () => {
    if (!confirmed) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/inventory/bulk-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope,
          update_type: type,
          value: Number(value)
        }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`${result.updated_count} prices updated successfully`);
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to update prices');
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
          <DialogTitle>Bulk Price Update</DialogTitle>
          <DialogDescription>Apply price changes to multiple medicines at once.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Select Scope</Label>
            <RadioGroup value={scope} onValueChange={setScope} className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="cursor-pointer font-semibold">All Items</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <RadioGroupItem value="category" id="cat" />
                <Label htmlFor="cat" className="cursor-pointer font-semibold">By Category</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Update Strategy</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase_pct">Increase by %</SelectItem>
                <SelectItem value="decrease_pct">Decrease by %</SelectItem>
                <SelectItem value="increase_flat">Increase by Rs. (Flat)</SelectItem>
                <SelectItem value="decrease_flat">Decrease by Rs. (Flat)</SelectItem>
                <SelectItem value="set_exact">Set Exact Price (All)</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              {type.includes('pct') ? <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /> : <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
              <Input type="number" className="pl-9" value={value} onChange={(e) => setValue(Number(e.target.value))} />
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed font-medium">
              This action will permanently update your inventory prices. We recommend exporting your inventory to CSV as a backup first.
            </p>
          </div>

          <div className="flex items-center space-x-2 px-1">
            <Checkbox id="confirm" checked={confirmed} onCheckedChange={(c) => setConfirmed(!!c)} />
            <Label htmlFor="confirm" className="text-xs font-bold cursor-pointer">I confirm that I want to update these prices</Label>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleBulkUpdate} disabled={!confirmed || submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Update Prices
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

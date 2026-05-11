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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Globe, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function SubmitGlobalDialog({
  open,
  onOpenChange,
  medicineId,
  medicineName
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicineId: string;
  medicineName: string;
}) {
  const [checklist, setChecklist] = useState({
    name: false,
    generic: false,
    company: false,
    unit: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = Object.values(checklist).every(v => v);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/inventory/submit-global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicine_id: medicineId }),
      });
      if (res.ok) {
        toast.success('Submitted for review! Thank you for contributing.');
        onOpenChange(false);
      } else {
        toast.error('Failed to submit');
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
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <Globe className="w-6 h-6" />
          </div>
          <DialogTitle>Submit to Global Database</DialogTitle>
          <DialogDescription>
            Help other pharmacies by making <strong>{medicineName}</strong> available to all MedPOS stores across Pakistan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-600 leading-relaxed italic">
               &quot;Once submitted, our team will review the medicine details. If approved, it will be added to the 25,000+ shared DRAP medicines. You&apos;ll receive a &apos;Contributor&apos; badge on your profile!&quot;
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Review Checklist</Label>
            <div className="space-y-2">
              <CheckItem
                label="Medicine name is spelled correctly"
                checked={checklist.name}
                onChange={(v) => setChecklist(prev => ({ ...prev, name: v }))}
              />
              <CheckItem
                label="Generic name / composition is accurate"
                checked={checklist.generic}
                onChange={(v) => setChecklist(prev => ({ ...prev, generic: v }))}
              />
              <CheckItem
                label="Company name is correct"
                checked={checklist.company}
                onChange={(v) => setChecklist(prev => ({ ...prev, company: v }))}
              />
              <CheckItem
                label="Unit/form (Tablet, Syrup, etc.) is correct"
                checked={checklist.unit}
                onChange={(v) => setChecklist(prev => ({ ...prev, unit: v }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
            Submit for Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CheckItem({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer" onClick={() => onChange(!checked)}>
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
  );
}

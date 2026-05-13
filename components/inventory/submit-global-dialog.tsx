'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Globe,
  ShieldCheck,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Trophy,
  ArrowRight,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { submitMedicineForReview } from '@/lib/submissions/actions';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  "Tablet", "Capsule", "Syrup", "Injection", "Ointment", "Cream", "Gel", "Drops", "Inhaler", "Other"
];

const UNITS = [
  "mg", "ml", "g", "mcg", "IU", "vial", "ampoule", "patch", "sachet"
];

interface SubmitGlobalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicineId: string;
  storeMedicineId: string;
  medicineName: string;
  genericName?: string;
  category?: string;
  company?: string;
  unit?: string;
  isControlled?: boolean;
  currentScope: string;
}

export function SubmitGlobalDialog({
  open,
  onOpenChange,
  medicineId,
  storeMedicineId,
  medicineName: initialMedicineName,
  genericName: initialGenericName,
  category: initialCategory,
  company: initialCompany,
  unit: initialUnit,
  isControlled: initialIsControlled = false,
  currentScope
}: SubmitGlobalDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: initialMedicineName,
    generic_name: initialGenericName || '',
    category: initialCategory || '',
    company: initialCompany || '',
    unit: initialUnit || '',
    is_controlled: initialIsControlled,
    notes: ''
  });

  const [checklist, setChecklist] = useState({
    spelling: false,
    generic: false,
    company: false,
    drap: false,
  });

  // Fetch submission data if pending or rejected
  useEffect(() => {
    if (open && (currentScope === 'pending_review' || currentScope === 'rejected')) {
      fetch(`/api/inventory/submit-global?medicine_id=${medicineId}`)
        .then(res => res.json())
        .then(data => setSubmissionData(data))
        .catch(err => console.error('Failed to fetch submission data', err));
    }
  }, [open, currentScope, medicineId]);

  const canMoveToStep2 = formData.name && formData.generic_name && formData.category && formData.company;
  const canSubmit = Object.values(checklist).every(v => v);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const result = await submitMedicineForReview({
        medicineId,
        storeMedicineId,
        updatedData: {
          name: formData.name,
          generic_name: formData.generic_name,
          category: formData.category,
          company: formData.company,
          unit: formData.unit,
          is_controlled: formData.is_controlled,
        },
        notes: formData.notes
      });

      if (result.success) {
        setSubmissionSuccess(true);
        toast.success('Submitted for review!');
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFixAndResubmit = () => {
    setStep(1);
    // currentScope will change when action is called
  };

  // State 2: Pending Review
  if (currentScope === 'pending_review') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submission Under Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl flex flex-col items-center text-center">
              <Clock className="h-12 w-12 text-blue-500 mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-blue-900">Under Review</h3>
              <p className="text-sm text-blue-700 mt-1">
                Submitted on {submissionData?.submitted_at ? new Date(submissionData.submitted_at).toLocaleDateString() : 'recently'}
              </p>
              <p className="text-xs text-blue-600 mt-2 font-medium">Expected review time: 24-48 hours</p>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 border-b pb-2">
                    <p className="text-sm font-bold">Submitted</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 border-b pb-2">
                    <p className="text-sm font-bold">Under Review</p>
                    <p className="text-xs text-blue-600 font-medium">In Progress</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 opacity-50">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-slate-400" />
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-sm font-bold">Decision</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
               </div>
            </div>

            <Button variant="link" className="w-full text-accent" onClick={() => {
                onOpenChange(false);
                router.push('/dashboard/inventory/submissions');
            }}>
                View All My Submissions
            </Button>

            <p className="text-xs text-center text-muted-foreground">
                Your submission is being reviewed. We will notify you by email and in-app notification once a decision is made.
            </p>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // State 3: Rejected
  if (currentScope === 'rejected') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submission Rejected</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="p-6 bg-red-50 border border-red-100 rounded-xl flex flex-col items-center text-center">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-bold text-red-900">Not Approved</h3>
              <p className="text-sm text-red-700 mt-1">
                Reviewed on {submissionData?.reviewed_at ? new Date(submissionData.reviewed_at).toLocaleDateString() : 'recently'}
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <Label className="text-amber-900 font-bold flex items-center gap-2 mb-1">
                    <Info className="h-4 w-4" />
                    Reason from reviewer:
                </Label>
                <p className="text-sm text-amber-800 italic">
                    {submissionData?.rejection_reason || "No reason provided."}
                </p>
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-700">What can I do?</h4>
                <ul className="text-xs space-y-2 text-slate-600">
                    <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1" />
                        Fix the issues mentioned above and resubmit
                    </li>
                    <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1" />
                        Or keep this medicine as private in your store
                    </li>
                    <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1" />
                        Contact support if you disagree with this decision
                    </li>
                </ul>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Keep as Private</Button>
            <Button className="flex-1" onClick={handleFixAndResubmit}>Fix & Resubmit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Success screen after submission
  if (submissionSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
            <div className="py-12 flex flex-col items-center text-center">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Submitted Successfully!</h2>
                <p className="text-slate-600 mt-2 max-w-xs">
                    Our team will review within 24-48 hours. You will receive an email notification once reviewed.
                </p>
                <div className="mt-8 p-4 bg-slate-50 border rounded-lg w-full">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Your submission:</p>
                    <p className="text-lg font-bold text-slate-900">{formData.name}</p>
                </div>
                <Button className="mt-8 w-full" onClick={() => onOpenChange(false)}>Close</Button>
            </div>
        </DialogContent>
      </Dialog>
    );
  }

  // State 1: Step 1 - Review Details
  if (step === 1) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">Submit to Global Medicine Database</DialogTitle>
                <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded">Step 1 of 2</span>
            </div>
            <DialogDescription>
                Review and update medicine details before submitting for global inclusion.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Medicine Name</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Panadol CF"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="generic">Generic Name / Composition</Label>
                    <Input
                        id="generic"
                        value={formData.generic_name}
                        onChange={(e) => setFormData({...formData, generic_name: e.target.value})}
                        placeholder="e.g. Paracetamol"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Unit/Form</Label>
                        <Select value={formData.unit} onValueChange={(v) => setFormData({...formData, unit: v})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="company">Company / Manufacturer</Label>
                    <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        placeholder="e.g. GSK"
                    />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                    <div className="space-y-0.5">
                        <Label>Is Controlled Substance?</Label>
                        <p className="text-[10px] text-muted-foreground">Requires prescription & tracking</p>
                    </div>
                    <Switch
                        checked={formData.is_controlled}
                        onCheckedChange={(v) => setFormData({...formData, is_controlled: v})}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes for Reviewer</Label>
                    <Textarea
                        id="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Please add this medicine — it is commonly sold in Lahore area pharmacies. DRAP registration: XYZ"
                    />
                </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => setStep(2)} disabled={!canMoveToStep2}>
                Review & Submit
                <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // State 1: Step 2 - Confirm
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
              <DialogTitle>Confirm Submission</DialogTitle>
              <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded">Step 2 of 2</span>
          </div>
          <DialogDescription>
              Please verify the information is correct before submitting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Submission Checklist</Label>
            <div className="space-y-2">
              <CheckItem
                label="Medicine name is spelled correctly in English"
                checked={checklist.spelling}
                onChange={(v) => setChecklist(prev => ({ ...prev, spelling: v }))}
              />
              <CheckItem
                label="Generic name / composition is accurate"
                checked={checklist.generic}
                onChange={(v) => setChecklist(prev => ({ ...prev, generic: v }))}
              />
              <CheckItem
                label="Company / manufacturer name is correct"
                checked={checklist.company}
                onChange={(v) => setChecklist(prev => ({ ...prev, company: v }))}
              />
              <CheckItem
                label="This medicine is registered by DRAP (to best of my knowledge)"
                checked={checklist.drap}
                onChange={(v) => setChecklist(prev => ({ ...prev, drap: v }))}
              />
            </div>
          </div>

          <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl flex gap-4">
            <div className="h-10 w-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0">
                <Trophy className="h-5 w-5 text-accent" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-accent">Become a MedPOS Contributor</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    If approved, this medicine will be available to all Pakistani pharmacy stores on MedPOS. You will earn a Contributor badge on your store profile.
                </p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t gap-2">
          <Button variant="outline" onClick={() => setStep(1)} disabled={submitting}>Back</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || submitting} className="flex-1">
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

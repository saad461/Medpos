'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, Info, Loader2, Save } from "lucide-react";
import { approveMedicine, rejectMedicine } from "@/lib/admin/actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const CATEGORIES = [
  "Tablet", "Capsule", "Syrup", "Injection", "Ointment", "Cream", "Gel", "Drops", "Inhaler", "Other"
];

const UNITS = [
  "mg", "ml", "g", "mcg", "IU", "vial", "ampoule", "patch", "sachet"
];

const REJECTION_TEMPLATES = [
  { label: "Duplicate Submission", value: "This medicine already exists in our database. Please search for it in the global inventory." },
  { label: "Incorrect Information", value: "The medicine information provided (name, generic, or company) appears to be incorrect or incomplete." },
  { label: "Cannot Verify DRAP", value: "We could not verify the DRAP registration for this medicine with the details provided." },
  { label: "Formatting Issues", value: "Please use proper capitalization and spelling for medicine names and generic composition." }
];

export function ReviewActions({
  submissionId,
  medicineId,
  medicine,
  storeOwnerEmail
}: {
  submissionId: string;
  medicineId: string;
  medicine: any;
  storeOwnerEmail: string;
}) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [requestingInfo, setRequestingInfo] = useState(false);

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Edit states for approval
  const [editData, setEditData] = useState({
    name: medicine.name,
    generic_name: medicine.generic_name || '',
    category: medicine.category || '',
    company: medicine.company || '',
    unit: medicine.unit || '',
    is_controlled: medicine.is_controlled || false
  });

  // Rejection state
  const [rejectionReason, setRejectionReason] = useState('');

  // Request Info state
  const [infoQuestion, setInfoQuestion] = useState('');

  const handleApprove = async () => {
    setApproving(true);
    try {
      const res = await approveMedicine(medicineId, editData);
      if (res.success) {
        toast.success('Medicine approved and added to global database');
        setApproveDialogOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setRejecting(true);
    try {
      const res = await rejectMedicine(medicineId, rejectionReason);
      if (res.success) {
        toast.success('Submission rejected and store notified');
        setRejectDialogOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject');
    } finally {
      setRejecting(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!infoQuestion) return;
    setRequestingInfo(true);
    try {
      const res = await fetch('/api/admin/request-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: storeOwnerEmail,
          medicineName: medicine.name,
          question: infoQuestion
        })
      });
      if (res.ok) {
        toast.success('Question sent to store owner');
        setInfoDialogOpen(false);
        setInfoQuestion('');
      } else {
        toast.error('Failed to send question');
      }
    } catch (error) {
      toast.error('Failed to send question');
    } finally {
      setRequestingInfo(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
        <Button
            className="w-full bg-success hover:bg-success/90"
            onClick={() => setApproveDialogOpen(true)}
        >
            <Check className="h-4 w-4 mr-2" />
            Approve & Publish
        </Button>
        <Button
            variant="outline"
            className="w-full text-danger border-danger/20 hover:bg-danger/10"
            onClick={() => setRejectDialogOpen(true)}
        >
            <X className="h-4 w-4 mr-2" />
            Reject Submission
        </Button>
        <Button
            variant="ghost"
            className="w-full text-accent"
            onClick={() => setInfoDialogOpen(true)}
        >
            <Info className="h-4 w-4 mr-2" />
            Request Info
        </Button>

        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Approve & Publish Medicine</DialogTitle>
                    <DialogDescription>
                        Review and fix any details before adding this medicine to the global database for all stores.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2 col-span-2">
                        <Label>Medicine Name</Label>
                        <Input
                            value={editData.name}
                            onChange={(e) => setEditData({...editData, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2 col-span-2">
                        <Label>Generic Name</Label>
                        <Input
                            value={editData.generic_name}
                            onChange={(e) => setEditData({...editData, generic_name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={editData.category} onValueChange={(v) => setEditData({...editData, category: v})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Unit/Form</Label>
                        <Select value={editData.unit} onValueChange={(v) => setEditData({...editData, unit: v})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                        <Label>Company</Label>
                        <Input
                            value={editData.company}
                            onChange={(e) => setEditData({...editData, company: e.target.value})}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 col-span-2">
                        <Label>Is Controlled Substance?</Label>
                        <Switch
                            checked={editData.is_controlled}
                            onCheckedChange={(v) => setEditData({...editData, is_controlled: v})}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleApprove} disabled={approving} className="bg-success hover:bg-success/90">
                        {approving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Approve & Add to Global DB
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Submission</DialogTitle>
                    <DialogDescription>
                        Explain why this submission is being rejected. The store owner will receive this reason.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Quick Templates</Label>
                        <div className="flex flex-wrap gap-2">
                            {REJECTION_TEMPLATES.map((t) => (
                                <Button
                                    key={t.label}
                                    variant="outline"
                                    size="sm"
                                    className="text-[10px] h-7"
                                    onClick={() => setRejectionReason(t.value)}
                                >
                                    {t.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Rejection Reason (required)</Label>
                        <Textarea
                            placeholder="Type the reason for rejection here..."
                            rows={4}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleReject}
                        disabled={rejecting || !rejectionReason}
                        className="bg-danger hover:bg-danger/90"
                    >
                        {rejecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                        Reject & Notify Store
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Info Dialog */}
        <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Request More Information</DialogTitle>
                    <DialogDescription>
                        Send a question to the store owner about this medicine. It will stay in pending status.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Your Question</Label>
                        <Textarea
                            placeholder="e.g. Can you please confirm the generic name or provide a photo of the packaging?"
                            rows={4}
                            value={infoQuestion}
                            onChange={(e) => setInfoQuestion(e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        An email will be sent to <strong>{storeOwnerEmail}</strong> with your question.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setInfoDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleRequestInfo}
                        disabled={!infoQuestion || requestingInfo}
                        className="bg-accent hover:bg-accent/90"
                    >
                        {requestingInfo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Send Question
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}

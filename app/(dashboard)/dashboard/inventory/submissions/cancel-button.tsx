'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cancelSubmission } from "@/lib/submissions/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function CancelSubmissionButton({
  medicineId,
  submissionId
}: {
  medicineId: string;
  submissionId: string
}) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this submission?')) return;

    setLoading(true);
    try {
      const res = await cancelSubmission({ medicineId, submissionId });
      if (res.success) {
        toast.success('Submission cancelled');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel submission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 text-xs text-danger hover:text-danger hover:bg-danger/10"
      disabled={loading}
      onClick={handleCancel}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Cancel'}
    </Button>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Clock, XCircle, Trophy } from 'lucide-react';
import { SubmissionStatusBadge } from '@/components/inventory/submission-status-badge';
import { SubmitGlobalDialog } from '@/components/inventory/submit-global-dialog';
import Link from 'next/link';

interface SubmissionSectionProps {
  medicine: {
    id: string;
    name: string;
    generic_name?: string;
    category?: string;
    company?: string;
    unit?: string;
    is_controlled: boolean;
    scope: string;
  };
  storeMedicineId: string;
}

export function SubmissionSection({ medicine, storeMedicineId }: SubmissionSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (medicine.scope === 'global') return null;

  return (
    <>
      <Card className="shadow-sm border-dashed border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    Share with All Pakistan Pharmacies
                </CardTitle>
                <SubmissionStatusBadge scope={medicine.scope} />
            </div>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          {medicine.scope === 'private' && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">This is a private medicine — only visible in your store.</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Submit it to help other pharmacies and earn a Contributor badge.
                </p>
              </div>
              <Button className="w-full font-bold" onClick={() => setDialogOpen(true)}>
                Submit to Global Database
              </Button>
            </div>
          )}

          {medicine.scope === 'pending_review' && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto animate-pulse">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Under review by MedPOS team.</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Expected review time: 24-48 hours. We will notify you once a decision is made.
                </p>
              </div>
              <Button variant="outline" className="w-full font-bold" asChild>
                <Link href="/dashboard/inventory/submissions">
                    View Submission Status
                </Link>
              </Button>
            </div>
          )}

          {medicine.scope === 'rejected' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-xs text-red-700">Your submission was not approved for the global database.</p>
              </div>
              <Button className="w-full font-bold" onClick={() => setDialogOpen(true)}>
                Fix & Resubmit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SubmitGlobalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        medicineId={medicine.id}
        storeMedicineId={storeMedicineId}
        medicineName={medicine.name}
        genericName={medicine.generic_name}
        category={medicine.category}
        company={medicine.company}
        unit={medicine.unit}
        isControlled={medicine.is_controlled}
        currentScope={medicine.scope}
      />
    </>
  );
}

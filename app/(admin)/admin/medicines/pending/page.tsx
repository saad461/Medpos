import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Store, User, Clock, AlertTriangle, Check, X, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ReviewActions } from "./review-actions";

export const dynamic = 'force-dynamic';

export default async function AdminPendingMedicinesPage() {
  const supabase = await createClient(true); // Service role to bypass RLS for admin view
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata.role !== 'super_admin') redirect('/login');

  const { data: submissions, error } = await supabase
    .from('medicine_submissions')
    .select(`
      id,
      submitted_at,
      notes,
      admin_notes,
      status,
      medicine_id,
      tenant_id,
      submitted_by_user,
      medicines (
        id,
        name,
        generic_name,
        category,
        company,
        unit,
        is_controlled
      ),
      tenants (
        name,
        owner_email
      ),
      users!medicine_submissions_submitted_by_user_fkey (
        name
      )
    `)
    .eq('status', 'pending_review')
    .order('submitted_at', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pending Medicine Reviews</h1>
        <p className="text-muted-foreground">Review and approve medicines submitted by store owners for the global database</p>
      </div>

      {!submissions || submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed rounded-xl">
          <FlaskConical className="h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-900">All caught up!</h2>
          <p className="text-slate-500 mt-1">There are no pending medicine submissions at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {submissions.map((submission: any) => (
            <SubmissionReviewCard key={submission.id} submission={submission} />
          ))}
        </div>
      )}
    </div>
  );
}

async function SubmissionReviewCard({ submission }: { submission: any }) {
  const supabase = await createClient(true);

  // Check for duplicates
  const { data: duplicates } = await supabase
    .from('medicines')
    .select('id, name, generic_name, company')
    .eq('scope', 'global')
    .textSearch('name', submission.medicines.name, {
      type: 'websearch',
      config: 'english',
    })
    .limit(3);

  return (
    <Card className="overflow-hidden border-2 hover:border-primary/20 transition-colors">
      <CardHeader className="bg-slate-50/50 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold">{submission.medicines.name}</CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending Review</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Store className="h-3 w-3" />
                    {submission.tenants.name}
                </span>
                <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {submission.users?.name || 'Unknown User'}
                </span>
                <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Submitted {formatDistanceToNow(new Date(submission.submitted_at))} ago
                </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Action buttons will be here */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="p-6 lg:col-span-2 space-y-6">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Medicine Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Generic Name</p>
                            <p className="text-sm font-bold">{submission.medicines.generic_name || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Category</p>
                            <p className="text-sm font-bold">{submission.medicines.category || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Company</p>
                            <p className="text-sm font-bold">{submission.medicines.company || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Unit</p>
                            <p className="text-sm font-bold">{submission.medicines.unit || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Controlled</p>
                            <p className="text-sm font-bold">{submission.medicines.is_controlled ? 'YES' : 'No'}</p>
                        </div>
                    </div>
                </div>

                {submission.notes && (
                    <div className="p-4 bg-slate-50 border rounded-lg">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Submitter Notes
                        </h4>
                        <p className="text-sm italic text-slate-700">&quot;{submission.notes}&quot;</p>
                    </div>
                )}

                {duplicates && duplicates.length > 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <h4 className="text-xs font-bold text-amber-800 uppercase mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Similar medicines in database
                        </h4>
                        <ul className="space-y-1">
                            {duplicates.map((dup: any) => (
                                <li key={dup.id} className="text-xs text-amber-700 flex items-center gap-2">
                                    <span className="font-bold">{dup.name}</span>
                                    <span className="opacity-70">({dup.generic_name} • {dup.company})</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-[10px] text-amber-600 mt-2 italic">⚠️ Check for duplicates before approving to keep the database clean.</p>
                    </div>
                )}
            </div>

            <div className="p-6 bg-slate-50/30 border-l lg:flex lg:flex-col lg:justify-center">
                <ReviewActions
                    submissionId={submission.id}
                    medicineId={submission.medicine_id}
                    medicine={submission.medicines}
                    storeOwnerEmail={submission.tenants.owner_email}
                />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

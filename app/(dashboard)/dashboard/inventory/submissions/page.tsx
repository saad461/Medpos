import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Trophy, Plus, ArrowRight, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ContributorBadge } from "@/components/inventory/contributor-badge";
import { SubmissionStatusBadge } from "@/components/inventory/submission-status-badge";
import { formatDistanceToNow } from "date-fns";
import { CancelSubmissionButton } from "./cancel-button"; // We'll need a client component for the button

export const dynamic = 'force-dynamic';

export default async function SubmissionsPage({
  searchParams
}: {
  searchParams: { tab?: string }
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const tenant_id = user.app_metadata.tenant_id;

  // Fetch store settings for contributor stats
  const { data: settings } = await supabase
    .from('store_settings')
    .select('contributor_count, is_contributor')
    .eq('tenant_id', tenant_id)
    .single();

  // Fetch submissions
  const { data: submissions } = await supabase
    .from('medicine_submissions')
    .select(`
      *,
      medicines (
        id,
        name,
        generic_name,
        category,
        company,
        unit,
        scope
      )
    `)
    .eq('tenant_id', tenant_id)
    .order('submitted_at', { ascending: false });

  const pendingCount = submissions?.filter(s => s.status === 'pending_review').length || 0;
  const approvedCount = submissions?.filter(s => s.status === 'approved').length || 0;
  const rejectedCount = submissions?.filter(s => s.status === 'rejected').length || 0;
  const cancelledCount = submissions?.filter(s => s.status === 'cancelled').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Submissions</h1>
          <p className="text-muted-foreground">Track medicines you have submitted to the global database</p>
        </div>
      </div>

      {settings?.is_contributor ? (
        <ContributorBadge
          size="lg"
          isContributor={true}
          contributorCount={settings.contributor_count}
        />
      ) : (
        <div className="w-full p-6 rounded-xl bg-accent/5 border border-accent/20 flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 rounded-full bg-accent/10 shrink-0">
            <FlaskConical className="h-8 w-8 text-accent" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-lg font-bold text-slate-900">Start Contributing</h2>
            <p className="text-slate-600 mt-1 max-w-2xl">
              Submit medicines to help build Pakistan&apos;s most complete medicine database. Earn a Contributor badge when your first submission is approved.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/inventory/add">
                <Plus className="h-4 w-4 mr-2" />
                Add & Submit
            </Link>
          </Button>
        </div>
      )}

      <Tabs defaultValue={searchParams.tab || "all"} className="w-full">
        <TabsList className="grid w-full grid-cols-5 md:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledCount})</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="all" className="space-y-4">
            {renderSubmissionCards(submissions || [])}
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            {renderSubmissionCards(submissions?.filter(s => s.status === 'pending_review') || [])}
          </TabsContent>
          <TabsContent value="approved" className="space-y-4">
            {renderSubmissionCards(submissions?.filter(s => s.status === 'approved') || [])}
          </TabsContent>
          <TabsContent value="rejected" className="space-y-4">
            {renderSubmissionCards(submissions?.filter(s => s.status === 'rejected') || [])}
          </TabsContent>
          <TabsContent value="cancelled" className="space-y-4">
            {renderSubmissionCards(submissions?.filter(s => s.status === 'cancelled') || [])}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function renderSubmissionCards(submissions: any[]) {
  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-xl bg-slate-50/50">
        <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-slate-900">No submissions found</h3>
        <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
          Add a medicine not in our database and submit it for review to get started.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/dashboard/inventory/add">
            Add Custom Medicine
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="overflow-hidden flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-bold leading-tight">
                        {submission.medicines?.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Submitted {formatDistanceToNow(new Date(submission.submitted_at))} ago
                    </CardDescription>
                </div>
                <SubmissionStatusBadge scope={submission.status === 'pending_review' ? 'pending_review' : (submission.status === 'approved' ? 'global' : (submission.status === 'rejected' ? 'rejected' : 'private'))} />
            </div>
          </CardHeader>
          <CardContent className="pb-4 space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-1.5 bg-slate-50 rounded border">
                    <p className="text-muted-foreground uppercase font-semibold tracking-tighter">Generic</p>
                    <p className="font-medium truncate" title={submission.medicines?.generic_name}>{submission.medicines?.generic_name || 'N/A'}</p>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border">
                    <p className="text-muted-foreground uppercase font-semibold tracking-tighter">Category</p>
                    <p className="font-medium truncate">{submission.medicines?.category || 'N/A'}</p>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border">
                    <p className="text-muted-foreground uppercase font-semibold tracking-tighter">Company</p>
                    <p className="font-medium truncate" title={submission.medicines?.company}>{submission.medicines?.company || 'N/A'}</p>
                </div>
                <div className="p-1.5 bg-slate-50 rounded border">
                    <p className="text-muted-foreground uppercase font-semibold tracking-tighter">Unit</p>
                    <p className="font-medium truncate">{submission.medicines?.unit || 'N/A'}</p>
                </div>
            </div>

            {submission.notes && (
                <div className="p-2 bg-slate-50/50 rounded border italic text-xs text-slate-600">
                    &quot;{submission.notes}&quot;
                </div>
            )}

            {submission.status === 'rejected' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                    <p className="font-bold mb-1">Rejection Reason:</p>
                    {submission.rejection_reason}
                </div>
            )}
          </CardContent>
          <div className="p-4 pt-0 border-t bg-slate-50/30 flex items-center justify-between gap-2">
            {submission.status === 'pending_review' && (
                <>
                    <div className="flex-1 text-[10px] text-muted-foreground">
                        <p>Est. review: 24-48 hours</p>
                    </div>
                    <CancelSubmissionButton
                        medicineId={submission.medicine_id}
                        submissionId={submission.id}
                    />
                </>
            )}

            {submission.status === 'approved' && (
                <>
                    <div className="flex-1 flex items-center gap-1.5 text-xs text-success font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" asChild>
                        <Link href={`/dashboard/inventory/${submission.medicine_id}`}>
                            View in DB
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    </Button>
                </>
            )}

            {submission.status === 'rejected' && (
                <>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" asChild>
                         <Link href={`/dashboard/inventory/${submission.medicine_id}`}>
                            Fix & Resubmit
                         </Link>
                    </Button>
                </>
            )}

            {submission.status === 'cancelled' && (
                <div className="w-full text-center text-xs text-muted-foreground italic">
                    This submission was cancelled
                </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

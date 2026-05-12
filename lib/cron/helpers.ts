import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  // Supabase client with service role key
  // Bypasses all RLS policies
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function subDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

export function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export function endOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export async function logCronRun(
  jobName: string,
  results: Record<string, unknown>,
  error?: string
): Promise<void> {
  const supabase = createAdminClient()
  await supabase.from('cron_logs').insert({
    job_name: jobName,
    results,
    error,
    success: !error,
    completed_at: new Date().toISOString(),
  })
}

export async function hasJobRunToday(jobName: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('cron_logs')
    .select('id')
    .eq('job_name', jobName)
    .eq('success', true)
    .gte('started_at', startOfDay(new Date()).toISOString())
    .limit(1)
  return (data?.length ?? 0) > 0
}

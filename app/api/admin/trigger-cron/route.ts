import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/cron/helpers'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user.app_metadata.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { job } = await request.json()
  const allowedJobs = ['expiry-alerts', 'low-stock-digest', 'subscription-check', 'drap-sync', 'reset-demo']

  if (!allowedJobs.includes(job)) {
    return NextResponse.json({ error: 'Invalid job' }, { status: 400 })
  }

  try {
    const cronUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/cron/${job}`
    const response = await fetch(cronUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
    })

    const result = await response.json()

    // Log manual trigger
    const adminSupabase = createAdminClient()
    await adminSupabase.from('cron_logs').insert({
      job_name: job,
      results: { ...result, triggered_manually: true },
      success: response.ok,
      completed_at: new Date().toISOString(),
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error(`Manual trigger failed for ${job}:`, error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { job } = await request.json()
    const allowedJobs = ['expiry-alerts', 'low-stock-digest', 'subscription-check', 'drap-sync', 'reset-demo']

    if (!allowedJobs.includes(job)) {
      return NextResponse.json({ error: 'Invalid job name' }, { status: 400 })
    }

    // Call the cron endpoint internally
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const host = request.headers.get('host')
    const cronUrl = `${protocol}://${host}/api/cron/${job}`

    const response = await fetch(cronUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    })

    const results = await response.json()
    return NextResponse.json({ success: true, results })

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

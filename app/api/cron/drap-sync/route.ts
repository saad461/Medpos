import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TODO: Step 12 — Sync medicine database with DRAP PDF/website
  return NextResponse.json({ message: 'Not implemented yet' }, { status: 200 })
}

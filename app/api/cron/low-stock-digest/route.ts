import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TODO: Step 14 — Weekly digest for low stock items per tenant
  return NextResponse.json({ message: 'Not implemented yet' }, { status: 200 })
}

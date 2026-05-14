// Payment processing disabled — manual payment mode
// Re-enable when Safepay KYC is approved
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'Payment processing not available yet' },
    { status: 503 }
  )
}

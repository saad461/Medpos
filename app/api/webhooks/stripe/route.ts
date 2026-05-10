import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') as string

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    // TODO: Step 10 — Handle subscription events
    console.log(`Unhandled event type ${event.type}`)

    return NextResponse.json({ message: 'Not implemented yet' }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }
}

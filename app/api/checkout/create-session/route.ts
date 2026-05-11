import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PLANS, PlanId } from '@/lib/safepay/plans'
import { safepayRequest } from '@/lib/safepay/client'

const schema = z.object({
  planId: z.enum(['starter', 'professional', 'business']),
  billing: z.enum(['monthly', 'yearly']),
  userId: z.string().uuid(),
  email: z.string().email(),
  storeName: z.string().min(2),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = schema.parse(body)

    // Check if already has a subscription
    const adminSupabase = await createClient(true)
    const { data: existingProfile } = await adminSupabase
      .from('users')
      .select('tenant_id')
      .eq('id', validated.userId)
      .single()

    if (existingProfile?.tenant_id) {
      const { data: existingSub } = await adminSupabase
        .from('subscriptions')
        .select('status')
        .eq('tenant_id', existingProfile.tenant_id)
        .eq('status', 'active')
        .single()

      if (existingSub) {
        return NextResponse.json({ error: 'You already have an active subscription' }, { status: 400 })
      }
    }

    const plan = PLANS[validated.planId as PlanId]
    const amount = validated.billing === 'monthly' ? plan.price_monthly : plan.price_yearly
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL

    const sessionResponse = await safepayRequest('/order/create', 'POST', {
      amount,
      currency: 'PKR',
      order_id: `medpos_${validated.userId}_${Date.now()}`,
      description: `MedPOS ${plan.name} Plan - ${validated.billing}`,
      customer_email: validated.email,
      redirect_url: `${APP_URL}/onboarding/success`,
      cancel_url: `${APP_URL}/onboarding?cancelled=true`,
      metadata: {
        user_id: validated.userId,
        plan_id: validated.planId,
        billing_cycle: validated.billing,
        store_name: validated.storeName,
      }
    })

    return NextResponse.json({ checkout_url: sessionResponse.data.checkout_url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}

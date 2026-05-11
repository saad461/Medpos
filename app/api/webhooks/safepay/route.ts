import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { slugify } from '@/lib/utils'
import { sendWelcomeEmail, sendAdminNotification, sendPaymentFailedEmail } from '@/lib/email/templates'

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSig)
    )
  } catch (e) {
    return false
  }
}

export async function POST(req: Request) {
  const payload = await req.text()
  const signature = req.headers.get('x-sfpy-signature') || ''
  const secret = process.env.SAFEPAY_WEBHOOK_SECRET!

  if (!verifyWebhookSignature(payload, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(payload)
  const { type, data, metadata, timestamp } = event

  // Prevent replay attacks
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  if (new Date(timestamp).getTime() < fiveMinutesAgo) {
    return NextResponse.json({ error: 'Webhook too old' }, { status: 400 })
  }

  const supabase = await createClient(true) // Service role

  try {
    switch (type) {
      case 'payment.success':
        await handlePaymentSuccess(supabase, data, metadata)
        break
      case 'payment.failed':
        await handlePaymentFailed(supabase, data, metadata)
        break
      case 'subscription.renewed':
        await handleSubscriptionRenewed(supabase, data)
        break
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(supabase, data)
        break
      case 'subscription.payment_failed':
        await handleSubscriptionPaymentFailed(supabase, data)
        break
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handlePaymentSuccess(supabase: any, data: any, metadata: any) {
  const { user_id, plan_id, billing_cycle, store_name } = metadata
  const paymentId = data.token

  // 1. Idempotency check
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('safepay_payment_id', paymentId)
    .single()

  if (existing) return

  // 2. Get user info
  const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id)
  if (userError || !user) throw new Error('User not found')

  const userName = user.user_metadata.name || 'Store Owner'
  const userPhone = user.user_metadata.phone
  const email = user.email!

  // 3. Create Tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      name: store_name,
      slug: slugify(store_name) + '-' + Math.random().toString(36).substring(2, 5),
      plan: plan_id,
      status: 'pending_admin_approval',
      owner_email: email,
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    })
    .select()
    .single()

  if (tenantError) throw tenantError

  // 4. Create Public User
  await supabase.from('users').insert({
    id: user_id,
    tenant_id: tenant.id,
    email: email,
    name: userName,
    phone: userPhone,
    role: 'owner'
  })

  // 5. Create Subscription
  const periodDays = billing_cycle === 'monthly' ? 30 : 365
  await supabase.from('subscriptions').insert({
    tenant_id: tenant.id,
    plan: plan_id,
    status: 'active',
    period_start: new Date().toISOString(),
    period_end: new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString(),
    safepay_payment_id: paymentId,
    billing_cycle: billing_cycle
  })

  // 6. Send Emails
  await sendWelcomeEmail({
    storeName: store_name,
    ownerName: userName,
    email: email,
    plan: plan_id.toUpperCase(),
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    whatsappNumber: '0300-MEDPOS'
  })

  await sendAdminNotification({
    storeName: store_name,
    planId: plan_id,
    email: email,
    amountPaid: data.amount
  })

  // 7. Audit Log
  await supabase.from('audit_logs').insert({
    tenant_id: tenant.id,
    user_id: user_id,
    action: 'SUBSCRIPTION_CREATED',
    table_name: 'subscriptions',
    new_value: { plan_id, billing_cycle, amount_paid: data.amount }
  })
}

async function handlePaymentFailed(supabase: any, data: any, metadata: any) {
  const { user_id, plan_id, store_name } = metadata
  const { data: { user } } = await supabase.auth.admin.getUserById(user_id)

  if (user) {
    await sendPaymentFailedEmail({
      storeName: store_name,
      ownerName: user.user_metadata.name || 'Store Owner',
      email: user.email!,
      planName: plan_id.toUpperCase(),
      retryUrl: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`
    })
  }
}

async function handleSubscriptionRenewed(supabase: any, data: any) {
  const { tenant_id } = data.metadata // Assuming metadata passed back in renewal
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, billing_cycle')
    .eq('tenant_id', tenant_id)
    .single()

  if (sub) {
    const periodDays = sub.billing_cycle === 'monthly' ? 30 : 365
    await supabase.from('subscriptions')
      .update({
        period_end: new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      })
      .eq('id', sub.id)

    await supabase.from('tenants')
      .update({ status: 'active' })
      .eq('id', tenant_id)
  }
}

async function handleSubscriptionCancelled(supabase: any, data: any) {
  const { tenant_id } = data.metadata
  await supabase.from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('tenant_id', tenant_id)
}

async function handleSubscriptionPaymentFailed(supabase: any, data: any) {
  const { tenant_id } = data.metadata
  await supabase.from('subscriptions')
    .update({ status: 'past_due' })
    .eq('tenant_id', tenant_id)

  // Logic for 7-day grace period would be checked in middleware or cron
}

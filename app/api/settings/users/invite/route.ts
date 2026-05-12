import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { TeamInviteEmail } from '@/emails/team-invite'
import { createAuditLog } from '@/lib/audit'
import { APP_URL } from '@/lib/constants'

const inviteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['admin', 'pharmacist', 'cashier']),
  message: z.string().optional(),
})

export async function POST(req: Request) {
  const supabase = await createClient()

  try {
    const { data: { user: requester } } = await supabase.auth.getUser()
    if (!requester) return new NextResponse('Unauthorized', { status: 401 })

    const tenantId = requester.app_metadata.tenant_id
    const requesterRole = requester.app_metadata.role

    if (requesterRole !== 'owner' && requesterRole !== 'admin' && requesterRole !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await req.json()
    const { name, email, role, message } = inviteSchema.parse(body)

    // Check plan limits
    const { data: tenant } = await supabase
      .from('tenants')
      .select('name, plan')
      .eq('id', tenantId)
      .single()

    const { count: currentCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_active', true)

    const planLimits = {
      starter: 1,
      professional: 5,
      business: 15
    }

    const limit = planLimits[tenant?.plan as keyof typeof planLimits] || 1
    if ((currentCount || 0) >= limit) {
      return NextResponse.json({
        error: `Your ${tenant?.plan} plan allows maximum ${limit} user(s). Upgrade to add more team members.`,
        upgrade_required: true,
      }, { status: 403 })
    }

    // Check if user already exists in this tenant
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'This user is already a member of your store.' }, { status: 400 })
    }

    // Generate token
    const token = crypto.randomUUID() + '-' + Date.now()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store invitation
    const { error: inviteError } = await supabase
      .from('invitations')
      .insert({
        tenant_id: tenantId,
        email,
        name,
        role,
        token,
        invited_by: requester.id,
        personal_message: message,
        expires_at: expiresAt.toISOString(),
      })

    if (inviteError) throw inviteError

    // Send Email
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured')
    if (!process.env.EMAIL_FROM) throw new Error('EMAIL_FROM is not configured')

    const resend = new Resend(process.env.RESEND_API_KEY)
    const baseUrl = APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://app.medpos.pk"
    const acceptUrl = `${baseUrl}/auth/invite?token=${token}`

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `${requester.user_metadata?.name || 'Someone'} invited you to join ${tenant?.name} on MedPOS`,
      react: TeamInviteEmail({
        inviteeName: name,
        storeName: tenant?.name || 'Store',
        inviterName: requester.user_metadata?.name || 'Store Owner',
        role,
        personalMessage: message,
        acceptUrl,
        expiresAt: expiresAt.toLocaleDateString(),
      }),
    })

    await createAuditLog({
      tenant_id: tenantId,
      user_id: requester.id,
      action: 'INVITE_USER',
      table_name: 'invitations',
      new_value: { email, role },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[INVITE_POST]', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

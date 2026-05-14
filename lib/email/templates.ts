import { Resend } from 'resend'
import { WelcomeEmail } from '@/emails/welcome'
import { PaymentFailedEmail } from '@/emails/payment-failed'
import { SubscriptionExpiringEmail } from '@/emails/subscription-expiring'
import { AccountApprovedEmail } from '@/emails/account-approved'
import { render } from '@react-email/render'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(props: any) {
  const html = await render(WelcomeEmail(props))
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: props.email,
    subject: `Welcome to MedPOS! Your store ${props.storeName} is ready`,
    html,
  })
}

export async function sendAdminNewSignupEmail(props: {
  storeName: string
  ownerName: string
  email: string
  phone: string
  plan: string
  billing: string
  trialEndsAt: string
  approveUrl: string
}) {
  const getAmount = (plan: string, billing: string) => {
    const prices: Record<string, { monthly: string; yearly: string }> = {
      starter: { monthly: '1,499', yearly: '14,990' },
      professional: { monthly: '2,999', yearly: '29,990' },
      business: { monthly: '5,499', yearly: '54,990' },
    }
    const p = prices[plan.toLowerCase()]
    return billing === 'monthly' ? p?.monthly : p?.yearly
  }

  const amount = getAmount(props.plan, props.billing)

  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: process.env.ADMIN_EMAIL!,
    subject: `🏪 New MedPOS Signup — ${props.storeName} — ${props.plan}`,
    html: `
      <h2>New Store Owner Signed Up</h2>
      <table border="0" cellpadding="8" cellspacing="0">
        <tr><td><b>Store Name:</b></td><td>${props.storeName}</td></tr>
        <tr><td><b>Owner Name:</b></td><td>${props.ownerName}</td></tr>
        <tr><td><b>Email:</b></td><td>${props.email}</td></tr>
        <tr><td><b>Phone:</b></td><td>${props.phone}</td></tr>
        <tr><td><b>Plan:</b></td><td>${props.plan} (${props.billing})</td></tr>
        <tr><td><b>Trial Ends:</b></td><td>${props.trialEndsAt}</td></tr>
      </table>

      <p><b>Action needed:</b></p>
      <ol>
        <li>Contact ${props.ownerName} on WhatsApp: ${props.phone}</li>
        <li>Collect payment: Rs. ${amount}</li>
        <li>Approve their account in admin panel</li>
      </ol>

      <a href="${props.approveUrl}" style="background:#1E3A5F;color:white;
      padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;">
      Open Admin Panel →
      </a>
    `,
  })
}

export async function sendAdminNotification(props: {
  storeName: string,
  planId: string,
  email: string,
  amountPaid: number,
}) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: process.env.ADMIN_EMAIL!,
    subject: `🆕 New MedPOS Subscriber — ${props.storeName} — Action Required`,
    html: `
      <h2>New Subscriber</h2>
      <p><strong>Store:</strong> ${props.storeName}</p>
      <p><strong>Plan:</strong> ${props.planId}</p>
      <p><strong>Email:</strong> ${props.email}</p>
      <p><strong>Amount:</strong> Rs. ${props.amountPaid}</p>
      <p><strong>Action needed:</strong> Approve their account in the admin panel.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/subscriptions">
        Open Admin Panel →
      </a>
    `,
  })
}

export async function sendPaymentFailedEmail(props: any) {
  const html = await render(PaymentFailedEmail(props))
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: props.email,
    subject: "Action Required — MedPOS Payment Failed",
    html,
  })
}

export async function sendSubscriptionExpiringEmail(props: any) {
  const html = await render(SubscriptionExpiringEmail(props))
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: props.email,
    subject: `Your MedPOS subscription expires in ${props.daysLeft} days`,
    html,
  })
}

export async function sendApprovalEmail(props: any) {
  const html = await render(AccountApprovedEmail(props))
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: props.email,
    subject: `🎉 Your MedPOS account is approved!`,
    html,
  })
}

export async function sendRejectionEmail(props: any) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: props.email,
    subject: "MedPOS subscription update",
    html: `
      <h2>MedPOS Update</h2>
      <p>We could not approve your account at this time.</p>
      <p><strong>Reason:</strong> ${props.reason}</p>
      <p><strong>Refund:</strong> ${props.refundMessage || 'A refund will be processed within 3-5 business days.'}</p>
      <p>Contact support if you have any questions.</p>
    `,
  })
}

export async function sendSuspensionEmail(props: any) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: props.email,
    subject: "Your MedPOS account has been suspended",
    html: `
      <h2>Account Suspension</h2>
      <p>Your store <strong>${props.storeName}</strong> has been suspended.</p>
      <p><strong>Reason:</strong> ${props.reason}</p>
      <p>${props.message || ''}</p>
      <p>Contact support immediately to resolve this issue.</p>
    `,
  })
}

export async function sendReactivationEmail(props: any) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: props.email,
    subject: "Your MedPOS account has been reactivated!",
    html: `
      <h2>Account Reactivated</h2>
      <p>Great news! Your store <strong>${props.storeName}</strong> is active again.</p>
      <p>You can now log in to your dashboard.</p>
    `,
  })
}

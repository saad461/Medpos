import { Resend } from 'resend'
import { WelcomeEmail } from '@/emails/welcome'
import { PaymentFailedEmail } from '@/emails/payment-failed'
import { SubscriptionExpiringEmail } from '@/emails/subscription-expiring'
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

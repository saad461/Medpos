import { Resend } from 'resend'
import { render } from '@react-email/render'
import { ReactElement } from 'react'

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder')

async function sendEmail({
  to,
  subject,
  template,
  emailType,
}: {
  to: string
  subject: string
  template: ReactElement
  emailType: string
}) {
  try {
    const html = await render(template)
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
    })
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error(`Failed to send ${emailType}:`, error)
    return { success: false }
  }
}

export async function sendExpiryAlertEmail(props: any) {
  const { ExpiryAlertEmail } = await import('@/emails/expiry-alert')
  const subject = props.expired.length > 0
    ? `🚨 URGENT: ${props.expired.length} medicines expired — ${props.storeName}`
    : props.next7.length > 0
    ? `⚠️ ${props.next7.length} medicines expiring this week — ${props.storeName}`
    : `📅 Monthly expiry report — ${props.storeName}`

  return sendEmail({
    to: props.ownerEmail,
    subject,
    template: ExpiryAlertEmail(props),
    emailType: 'expiry_alert',
  })
}

export async function sendLowStockDigestEmail(props: any) {
  const { LowStockDigestEmail } = await import('@/emails/low-stock-digest')
  const totalAttention = props.outOfStock.length + props.lowStock.length
  const subject = `📦 Weekly Stock Alert — ${totalAttention} medicines need attention — ${props.storeName}`

  return sendEmail({
    to: props.ownerEmail,
    subject,
    template: LowStockDigestEmail(props),
    emailType: 'low_stock_digest',
  })
}

export async function sendSupplierReorderEmail(props: any) {
  const { SupplierReorderEmail } = await import('@/emails/supplier-reorder')
  const subject = `Reorder Request from ${props.storeName}`

  return sendEmail({
    to: props.supplierEmail,
    subject,
    template: SupplierReorderEmail(props),
    emailType: 'supplier_reorder',
  })
}

export async function sendSubscriptionExpiringEmail(props: any) {
  const { SubscriptionExpiringEmail } = await import('@/emails/subscription-expiring')
  const subject = props.daysLeft === 1
    ? `⚠️ URGENT: MedPOS subscription expires TOMORROW — ${props.storeName}`
    : `🔔 Your MedPOS subscription expires in ${props.daysLeft} days — ${props.storeName}`

  return sendEmail({
    to: props.ownerEmail,
    subject,
    template: SubscriptionExpiringEmail(props),
    emailType: 'subscription_expiring',
  })
}

export async function sendSubscriptionExpiredEmail(props: any) {
  const { SubscriptionExpiredEmail } = await import('@/emails/subscription-expired')
  const subject = `Your MedPOS subscription has ended — ${props.storeName}`

  return sendEmail({
    to: props.ownerEmail,
    subject,
    template: SubscriptionExpiredEmail(props),
    emailType: 'subscription_expired',
  })
}

export async function sendDRAPUpdateEmail(props: any) {
  const { DRAPUpdateEmail } = await import('@/emails/drap-update')
  const subject = `💊 DRAP price update — ${props.updatedCount} medicines updated — ${props.storeName}`

  return sendEmail({
    to: props.ownerEmail,
    subject,
    template: DRAPUpdateEmail(props),
    emailType: 'drap_update',
  })
}

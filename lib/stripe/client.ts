import Stripe from 'stripe'
import { loadStripe, Stripe as StripeClient } from '@stripe/stripe-js'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any, // Use latest stable
  appInfo: {
    name: 'MedPOS',
    version: '0.1.0',
  },
})

let stripePromise: Promise<StripeClient | null>
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

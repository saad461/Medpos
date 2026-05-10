import { Metadata } from 'next'
import { Hero } from '@/components/marketing/hero'
import { StatsBar } from '@/components/marketing/stats-bar'
import { Features } from '@/components/marketing/features'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { PricingCards } from '@/components/marketing/pricing-cards'
import { Testimonials } from '@/components/marketing/testimonials'
import { FAQ } from '@/components/marketing/faq'
import { CTABanner } from '@/components/marketing/cta-banner'

export const metadata: Metadata = {
  title: 'MedPOS — Medical Store Management System for Pakistan',
  description: 'Cloud-based POS billing, inventory management, expiry tracking, and sales reports for Pakistani pharmacies. 3,000+ DRAP medicines pre-loaded.',
  keywords: 'medical store software Pakistan, pharmacy POS, dukaan management, medicine inventory Pakistan',
  openGraph: {
    title: 'MedPOS — Medical Store Management System',
    description: 'Manage your pharmacy from anywhere. POS billing, inventory, reports.',
    url: 'https://medpos.pk',
    siteName: 'MedPOS',
    locale: 'en_PK',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <PricingCards />
      <Testimonials />
      <FAQ />
      <CTABanner />
    </div>
  )
}

import { Metadata } from 'next'
import { DemoHero } from '@/components/demo/demo-hero'
import { DemoCredentials } from '@/components/demo/demo-credentials'
import { DemoInstructions } from '@/components/demo/demo-instructions'
import { DemoFeatureTabs } from '@/components/demo/demo-feature-tabs'
import { DemoCTA } from '@/components/demo/demo-cta'

export const metadata: Metadata = {
  title: 'Live Demo — MedPOS Medical Store Management',
  description: 'Try MedPOS free. Watch our Urdu tutorial and log in with demo credentials to explore the full pharmacy management dashboard.',
  openGraph: {
    title: 'Try MedPOS Live Demo',
    description: 'Watch the Urdu tutorial and explore the full dashboard with demo login.',
    url: 'https://medpos.pk/demo',
  },
}

export default function DemoPage() {
  return (
    <div className="bg-surface min-h-screen">
      <DemoHero />
      <DemoCredentials />
      <DemoInstructions />
      <DemoFeatureTabs />
      <DemoCTA />
    </div>
  )
}

import { Metadata } from 'next'
import { DemoHero } from '@/components/demo/demo-hero'
import { DemoInstructions } from '@/components/demo/demo-instructions'
import { DemoFeatureTabs } from '@/components/demo/demo-feature-tabs'
import { DemoCredentials } from '@/components/demo/demo-credentials'
import { DemoCTA } from '@/components/demo/demo-cta'

export const metadata: Metadata = {
  title: 'Live Demo — MedPOS',
  description: 'Try MedPOS live demo. Explore POS billing, inventory management, and reports with our pre-loaded demo account.',
}

export default function DemoPage() {
  return (
    <div className="flex flex-col">
      <DemoHero />

      <div id="demo-credentials" className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-20">
            <DemoCredentials />
            <DemoInstructions />
          </div>
        </div>
      </div>

      <div className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Explore Key Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            MedPOS is built specifically for the needs of Pakistani pharmacies. Explore how we handle everything from billing to inventory.
          </p>
        </div>
        <DemoFeatureTabs />
      </div>

      <DemoCTA />
    </div>
  )
}

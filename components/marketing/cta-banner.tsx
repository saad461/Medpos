import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTABanner() {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-[-20deg] translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/4 h-2/3 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10 text-center text-white">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto leading-tight">
          Ready to Modernize Your Pharmacy?
        </h2>
        <p className="text-white/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Join hundreds of Pakistani pharmacy owners managing their stores smarter with MedPOS.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="h-14 px-10 text-lg font-bold bg-white text-primary hover:bg-white/90 gap-2 w-full sm:w-auto" asChild>
            <Link href="/signup">
              Start Free Trial — 14 Days Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold border-white text-white hover:bg-white/10 w-full sm:w-auto" asChild>
            <Link href="/demo">
              See Demo First
            </Link>
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-white/60 text-sm">
          <span>✓ No credit card required</span>
          <span>✓ Setup in 5 minutes</span>
          <span>✓ Cancel anytime</span>
        </div>
      </div>
    </section>
  )
}

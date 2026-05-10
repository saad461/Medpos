import Link from 'next/link'
import { ArrowRight, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DemoCTA() {
  return (
    <section className="bg-primary py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-[-20deg] translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">Ready to Run Your Pharmacy Like This?</h2>
          <p className="text-white/80 text-xl max-w-2xl mx-auto leading-relaxed">
            You have seen what MedPOS can do. Now set it up for your own store in under 5 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 max-w-5xl mx-auto">
          {/* Column 1: Before */}
          <div className="space-y-6">
            <h4 className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs">❌</span>
              Before MedPOS
            </h4>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                Paper register or Excel
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                No expiry tracking
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                Can't check sales remotely
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                Stock count done manually
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                No customer records
              </li>
            </ul>
          </div>

          {/* Column 2: Divider */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <div className="h-full w-px bg-white/10 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <ArrowRight className="h-5 w-5 text-white/40" />
              </div>
            </div>
          </div>

          {/* Column 3: After */}
          <div className="space-y-6">
            <h4 className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-success text-xs">✅</span>
              With MedPOS
            </h4>
            <ul className="space-y-4 text-white/90">
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-success" />
                Cloud dashboard anywhere
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-success" />
                Automatic expiry alerts
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-success" />
                Check sales from your phone
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-success" />
                Real-time stock levels
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-4 w-4 text-success" />
                Full customer history
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="h-16 px-10 text-lg font-bold bg-white text-primary hover:bg-white/90 gap-2 w-full sm:w-auto shadow-xl" asChild>
            <Link href="/signup">
              Start Free Trial — 14 Days Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold border-white text-white hover:bg-white/10 w-full sm:w-auto" asChild>
            <Link href="#demo-credentials">
              Try Demo Again
            </Link>
          </Button>
        </div>

        <div className="mt-12 text-center text-white/60 text-sm">
          No credit card required • Your own store, your own data • Cancel anytime
        </div>
      </div>
    </section>
  )
}

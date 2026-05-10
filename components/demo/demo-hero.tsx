import Link from 'next/link'
import { CheckCircle2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DemoHero() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold tracking-widest uppercase">
              🎬 Live Demo
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
              See MedPOS in Action
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              Watch our complete Urdu tutorial below, then log in with the demo account to explore every feature yourself — no signup needed.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="font-medium">Full dashboard access with demo account</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="font-medium">Real Pakistan medicine data pre-loaded</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="font-medium">No credit card or signup required to try</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="h-14 px-8 text-lg font-bold" asChild>
                <Link href="#demo-credentials">Try Demo Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-primary text-primary" asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Stats Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <h3 className="text-xl font-bold text-primary mb-8 pb-4 border-b border-slate-50">
              What's in the Demo Account
            </h3>
            <ul className="space-y-6">
              <li className="flex items-center gap-4 text-slate-700">
                <span className="text-2xl">📦</span>
                <div>
                  <p className="font-bold">50 medicines pre-loaded</p>
                  <p className="text-xs text-muted-foreground uppercase">Pakistan brands & generic names</p>
                </div>
              </li>
              <li className="flex items-center gap-4 text-slate-700">
                <span className="text-2xl">🧾</span>
                <div>
                  <p className="font-bold">30 days of sample sales</p>
                  <p className="text-xs text-muted-foreground uppercase">Realistic transaction history</p>
                </div>
              </li>
              <li className="flex items-center gap-4 text-slate-700">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="font-bold">25 sample customers</p>
                  <p className="text-xs text-muted-foreground uppercase">Contact details & purchase history</p>
                </div>
              </li>
              <li className="flex items-center gap-4 text-slate-700">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-bold">Full reports with real numbers</p>
                  <p className="text-xs text-muted-foreground uppercase">Charts, profit/loss, & tax summaries</p>
                </div>
              </li>
              <li className="flex items-center gap-4 text-slate-700">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-bold">3 expiring medicines</p>
                  <p className="text-xs text-muted-foreground uppercase">Live alerts showing system behavior</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Video Section */}
        <div className="mt-20 max-w-5xl mx-auto space-y-4">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="MedPOS Urdu Tutorial — Medical Store Management System"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
              <span>🎬</span>
              Complete tutorial in Urdu — covers POS billing, inventory, reports, and settings (12 minutes)
            </p>
            {/* TODO: Replace YouTube ID with actual Urdu tutorial video */}
          </div>
        </div>
      </div>
    </section>
  )
}

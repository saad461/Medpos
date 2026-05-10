import Link from 'next/link'
import { ArrowRight, Play, CheckCircle2, Search, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-accent/5 -z-20" />
      <div
        className="absolute inset-0 opacity-[0.03] -z-10"
        style={{ backgroundImage: 'radial-gradient(#1E3A5F 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Side Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-500">
              <span role="img" aria-label="Pakistan Flag">🇵🇰</span>
              Built for Pakistan Pharmacies
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-primary leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Manage Your Medical Store <br />
              <span className="text-accent">From Anywhere</span> in the World
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              Complete POS billing, inventory management, expiry tracking,
              and sales reports — all in one cloud dashboard.
              3,000+ Pakistan medicines pre-loaded.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Button size="lg" className="h-14 px-8 text-lg gap-2" asChild>
                <Link href="/signup">
                  Start Free Trial — 14 Days Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2 border-primary text-primary hover:bg-primary/5" asChild>
                <Link href="/demo">
                  <Play className="h-5 w-5 fill-primary" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-4 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Setup in under 5 minutes
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Right Side Mockup */}
          <div className="lg:col-span-5 hidden lg:block perspective-1000">
            <div className="relative animate-in fade-in zoom-in duration-1000 delay-300 rotate-y-[-5deg] rotate-x-[2deg] -rotate-1">
              <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                {/* Browser Top Bar */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 max-w-[200px] bg-white border border-slate-200 rounded px-3 py-1 text-[10px] text-slate-400 font-mono truncate ml-4">
                    app.medpos.pk
                  </div>
                </div>

                {/* Dashboard Contents Mockup */}
                <div className="bg-slate-50 p-4 grid grid-cols-12 gap-4 h-[400px]">
                  {/* Left: Search & Items */}
                  <div className="col-span-7 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-2 flex items-center gap-2 shadow-sm">
                      <Search className="h-4 w-4 text-slate-400" />
                      <div className="w-full h-4 bg-slate-100 rounded" />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { name: 'Panadol 500mg', company: 'GSK', price: 'Rs. 3.5' },
                        { name: 'Augmentin 625mg', company: 'GSK', price: 'Rs. 90.0' },
                        { name: 'Disprin 300mg', company: 'Reckitt', price: 'Rs. 3.0' }
                      ].map((item, i) => (
                        <div
                          key={item.name}
                          className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500"
                          style={{ animationDelay: `${700 + (i * 200)}ms` }}
                        >
                          <div className="space-y-1">
                            <p className="font-bold text-xs text-primary">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">{item.company}</p>
                          </div>
                          <p className="text-xs font-bold text-accent">{item.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Cart */}
                  <div className="col-span-5 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
                    <div className="p-3 border-b border-slate-100 flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      <p className="font-bold text-xs">Current Sale</p>
                    </div>
                    <div className="flex-1 p-3 space-y-3">
                      <div className="flex justify-between text-[10px] animate-in fade-in duration-500 delay-[1400ms]">
                        <span>Panadol x 2</span>
                        <span className="font-bold">Rs. 7.00</span>
                      </div>
                      <div className="flex justify-between text-[10px] animate-in fade-in duration-500 delay-[1600ms]">
                        <span>Augmentin x 1</span>
                        <span className="font-bold">Rs. 90.00</span>
                      </div>
                    </div>
                    <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Total</span>
                        <span className="text-primary text-sm">Rs. 97.00</span>
                      </div>
                      <div className="w-full h-8 bg-success rounded flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                        Checkout
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent/20 rounded-full blur-2xl -z-10" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

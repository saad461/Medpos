'use client'

import { Star } from 'lucide-react'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    name: "Ahmed Raza",
    store: "Al-Shifa Medical Store",
    city: "Lahore",
    initials: "AR",
    color: "bg-blue-100 text-blue-600",
    quote: "Before MedPOS, I used to write everything in a register. Now I can check my sales from home on my phone. The expiry alerts alone saved me thousands of rupees."
  },
  {
    name: "Fatima Malik",
    store: "City Pharmacy",
    city: "Karachi",
    initials: "FM",
    color: "bg-green-100 text-green-600",
    quote: "The barcode scanner feature is amazing. My cashier can bill 3x faster now. Setup was so easy — I was running my first sale in 20 minutes."
  },
  {
    name: "Usman Khan",
    store: "Khan Medical Centre",
    city: "Peshawar",
    initials: "UK",
    color: "bg-purple-100 text-purple-600",
    quote: "I have two stores and I can see both from one screen. The medicine database already had 90% of what I stock. Very good system for Pakistan."
  }
]

export function Testimonials() {
  const { targetRef, isIntersecting } = useIntersectionObserver()

  return (
    <section id="testimonials" className="py-24 bg-white" ref={targetRef}>
      <div className="container mx-auto px-4 text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">
          Trusted by Pharmacy Owners Across Pakistan
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          From Karachi to Lahore to Peshawar — MedPOS is helping stores work smarter.
        </p>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <div
            key={t.name}
            className={cn(
              "bg-white p-8 rounded-2xl shadow-md border border-slate-100 flex flex-col transition-all duration-700 ease-out",
              isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, star) => (
                <Star key={star} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <p className="text-primary italic text-lg leading-relaxed mb-8 flex-1">
              "{t.quote}"
            </p>

            <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg", t.color)}>
                {t.initials}
              </div>
              <div className="text-left">
                <p className="font-bold text-primary">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.store}, {t.city}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

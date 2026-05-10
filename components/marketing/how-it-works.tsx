'use client'

import { UserPlus, CreditCard, Store, Lightbulb } from 'lucide-react'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'
import { cn } from '@/lib/utils'

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up & Choose a Plan",
    desc: "Create your account with email. Select the plan that fits your store size. 14-day free trial — no card needed."
  },
  {
    icon: CreditCard,
    title: "Subscribe & Get Instant Access",
    desc: "Pay securely via Stripe. Your store dashboard is created automatically in under 60 seconds. Welcome email sent instantly."
  },
  {
    icon: Store,
    title: "Start Managing Your Store",
    desc: "Add your medicines, set your prices, and start billing customers. Guided tour walks you through everything step by step."
  }
]

export function HowItWorks() {
  const { targetRef, isIntersecting } = useIntersectionObserver()

  return (
    <section id="how-it-works" className="py-24 bg-white" ref={targetRef}>
      <div className="container mx-auto px-4 text-center mb-20">
        <p className="text-accent text-sm font-bold tracking-widest uppercase mb-4">
          Simple Setup
        </p>
        <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">
          Up and Running in 3 Simple Steps
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          No technical knowledge needed. No installation. Works on any device.
        </p>
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Connector Line (Desktop) */}
        <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-primary/20 -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={cn(
                "text-center space-y-6 transition-all duration-700 ease-out",
                isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary mb-4 relative z-10 shadow-inner">
                  <step.icon className="h-8 w-8" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-primary rounded-full flex items-center justify-center font-bold text-primary text-sm shadow-sm z-20">
                  0{i + 1}
                </div>
              </div>
              <h3 className="text-xl font-bold text-primary tracking-tight">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed px-4">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Highlight Box */}
        <div className={cn(
          "mt-20 p-8 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-6 max-w-3xl mx-auto transition-all duration-1000 delay-700",
          isIntersecting ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>
          <div className="hidden sm:flex w-12 h-12 bg-white rounded-full items-center justify-center flex-shrink-0 shadow-sm border border-primary/10">
            <Lightbulb className="h-6 w-6 text-primary fill-primary/10" />
          </div>
          <p className="text-primary font-medium text-lg leading-relaxed">
            <span className="font-bold">Most store owners</span> complete their first sale within 15 minutes of signing up.
          </p>
        </div>
      </div>
    </section>
  )
}

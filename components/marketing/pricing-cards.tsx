'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'

const plans = [
  {
    name: "Starter",
    monthly: 1499,
    yearly: 14990,
    desc: "For small medical stores starting out.",
    features: [
      { text: "1 User (Owner only)", included: true },
      { text: "POS Billing", included: true },
      { text: "Inventory + Expiry Tracking", included: true },
      { text: "Daily & Monthly Reports", included: true },
      { text: "100 Customers", included: true },
      { text: "Basic PDF Invoices", included: true },
      { text: "10 Private Medicines/month", included: true },
      { text: "Email Support", included: true },
      { text: "Multiple Users", included: false },
      { text: "Supplier Management", included: false },
      { text: "Purchase Orders", included: false },
      { text: "Full Reports + CSV Export", included: false },
      { text: "Audit Log", included: false },
      { text: "Bulk Price Update", included: false },
    ]
  },
  {
    name: "Professional",
    popular: true,
    monthly: 2999,
    yearly: 29990,
    desc: "The complete solution for growing pharmacies.",
    features: [
      { text: "5 Users", included: true },
      { text: "POS Billing", included: true },
      { text: "Inventory + Expiry Tracking", included: true },
      { text: "Full Reports + CSV Export", included: true },
      { text: "Unlimited Customers", included: true },
      { text: "Supplier Management", included: true },
      { text: "Purchase Orders", included: true },
      { text: "Custom PDF Invoices + Branding", included: true },
      { text: "Unlimited Private Medicines", included: true },
      { text: "Submit to Global Medicine DB", included: true },
      { text: "Multi-User Roles", included: true },
      { text: "Audit Log", included: true },
      { text: "Bulk Price Update", included: true },
      { text: "Chat + Email Support", included: true },
    ]
  },
  {
    name: "Business",
    monthly: 5499,
    yearly: 54990,
    desc: "For large pharmacies with multiple staff.",
    features: [
      { text: "15 Users", included: true },
      { text: "Everything in Professional", included: true },
      { text: "Custom Logo on Receipts", included: true },
      { text: "Shift Management", included: true },
      { text: "Priority Support", included: true },
      { text: "WhatsApp Support", included: true },
      { text: "Dedicated Onboarding Call", included: true },
      { text: "Custom Reports Request", included: true },
      { text: "API Access", included: true },
      { text: "Multi-store Management", included: true },
    ]
  }
]

export function PricingCards() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const { targetRef, isIntersecting } = useIntersectionObserver()

  return (
    <section id="pricing" className="py-24 bg-surface" ref={targetRef}>
      <div className="container mx-auto px-4 text-center mb-12">
        <p className="text-accent text-sm font-bold tracking-widest uppercase mb-4">
          Simple Pricing
        </p>
        <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">
          Choose the Right Plan for Your Store
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          All plans include a 14-day free trial. No credit card required to start.
        </p>

        {/* Toggle */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <span className={cn("text-sm font-medium", billingCycle === 'monthly' ? "text-primary" : "text-muted-foreground")}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-8 bg-slate-200 rounded-full p-1 relative transition-colors duration-300"
            aria-label="Toggle billing cycle"
          >
            <div className={cn(
              "w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300",
              billingCycle === 'yearly' ? "translate-x-6" : "translate-x-0"
            )} />
          </button>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", billingCycle === 'yearly' ? "text-primary" : "text-muted-foreground")}>
              Yearly
            </span>
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20 animate-pulse">
              Save 2 Months
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, i) => (
          <div
            key={plan.name}
            className={cn(
              "bg-white rounded-2xl p-8 flex flex-col transition-all duration-700 ease-out h-full",
              plan.popular
                ? "border-2 border-primary shadow-xl scale-105 z-10 relative"
                : "border border-slate-200 shadow-sm hover:shadow-md",
              isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-accent text-white px-4 py-1 uppercase text-[10px] tracking-widest font-bold border-none">
                  Most Popular
                </Badge>
              </div>
            )}

            <div className="mb-8 text-center">
              <h3 className="text-xl font-bold text-primary mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm h-10">{plan.desc}</p>
              <div className="mt-6 flex items-baseline justify-center gap-1">
                <span className="text-sm font-bold text-slate-400">Rs.</span>
                <span className="text-4xl font-bold text-primary tracking-tight">
                  {billingCycle === 'monthly' ? plan.monthly.toLocaleString() : plan.yearly.toLocaleString()}
                </span>
                <span className="text-muted-foreground text-sm">
                  /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-10 flex-1 border-t border-slate-50 pt-8">
              {plan.features.slice(0, 8).map((feature) => (
                <div key={feature.text} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
                  )}
                  <span className={cn("text-sm", feature.included ? "text-slate-700" : "text-slate-400")}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <Button
              className={cn(
                "w-full h-12 text-md font-bold uppercase tracking-wide",
                plan.popular ? "bg-primary text-white" : "variant-outline border-primary text-primary hover:bg-primary/5"
              )}
              variant={plan.popular ? 'default' : 'outline'}
              asChild
            >
              <Link href="/signup">Start Free Trial</Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center space-y-4 max-w-2xl mx-auto px-4">
        <p className="text-slate-500 text-sm">
          All plans include: 14-day free trial • Automatic DRAP medicine updates • 99.9% uptime • Data backup • Cancel anytime
        </p>
        <p className="text-slate-400 text-xs">
          Prices in Pakistani Rupees (PKR). GST may apply.
        </p>
      </div>
    </section>
  )
}

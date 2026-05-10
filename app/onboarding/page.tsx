'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/shared/logo'
import { Check, CheckCircle2, ShieldCheck, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const plans = [
  {
    id: 'starter',
    name: "Starter",
    monthly: 1499,
    yearly: 14990,
    desc: "For small medical stores starting out.",
    features: [
      "1 User (Owner only)",
      "POS Billing",
      "Inventory + Expiry Tracking",
      "Daily & Monthly Reports",
      "100 Customers",
      "Basic PDF Invoices",
    ]
  },
  {
    id: 'professional',
    name: "Professional",
    popular: true,
    monthly: 2999,
    yearly: 29990,
    desc: "The complete solution for growing pharmacies.",
    features: [
      "5 Users",
      "Everything in Starter",
      "Full Reports + CSV Export",
      "Unlimited Customers",
      "Supplier Management",
      "Purchase Orders",
      "Custom Branding",
    ]
  },
  {
    id: 'business',
    name: "Business",
    monthly: 5499,
    yearly: 54990,
    desc: "For large pharmacies with multiple staff.",
    features: [
      "15 Users",
      "Everything in Professional",
      "Shift Management",
      "Priority Support",
      "WhatsApp Support",
      "Dedicated Onboarding Call",
    ]
  }
]

export default function OnboardingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const handleChoosePlan = (planId: string) => {
    toast.info(`Plan ${planId} selected. Stripe integration coming in Step 6!`)
    console.log('Selected Plan:', planId, billingCycle)
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Step 1 of 2</span>
            <span className="text-sm font-bold text-primary">Choose Your Plan</span>
          </div>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-accent" />
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex w-1/3 max-w-sm bg-white border-r p-12 flex-col space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-primary tracking-tight">You are almost ready!</h2>
            <p className="text-slate-600 leading-relaxed">
              Complete these final steps to activate your MedPOS dashboard.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-success/10 rounded-full p-1">
                <Check className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="font-bold text-primary">Account created</p>
                <p className="text-xs text-muted-foreground">Your login details are secure</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-success/10 rounded-full p-1">
                <Check className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="font-bold text-primary">Email verified</p>
                <p className="text-xs text-muted-foreground">Communications are enabled</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 w-6 h-6 rounded-full border-2 border-accent flex items-center justify-center text-xs font-bold text-accent">
                3
              </div>
              <div>
                <p className="font-bold text-primary">Choose a plan</p>
                <p className="text-xs text-accent font-bold uppercase tracking-widest">Current Step</p>
              </div>
            </div>
            <div className="flex items-start gap-4 opacity-40">
              <div className="mt-1 w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-xs font-bold text-slate-400">
                4
              </div>
              <div>
                <p className="font-bold text-slate-500">Start managing</p>
                <p className="text-xs text-muted-foreground">Access your POS dashboard</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t space-y-4">
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
              <ShieldCheck className="h-4 w-4 text-success" />
              Secure Checkout via Stripe
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">Choose Your Plan to Get Started</h1>
              <p className="text-lg text-slate-600">14-day free trial on all plans. Cancel anytime.</p>

              {/* Toggle */}
              <div className="mt-10 flex items-center justify-center gap-4">
                <span className={cn("text-sm font-bold uppercase tracking-widest", billingCycle === 'monthly' ? "text-primary" : "text-muted-foreground")}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="w-14 h-8 bg-slate-200 rounded-full p-1 relative transition-colors duration-300"
                >
                  <div className={cn(
                    "w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300",
                    billingCycle === 'yearly' ? "translate-x-6" : "translate-x-0"
                  )} />
                </button>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-bold uppercase tracking-widest", billingCycle === 'yearly' ? "text-primary" : "text-muted-foreground")}>
                    Yearly
                  </span>
                  <Badge className="bg-success/10 text-success border-success/20">Save 2 Months</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "bg-white rounded-2xl p-8 flex flex-col border shadow-sm relative transition-all",
                    plan.popular ? "border-primary ring-1 ring-primary shadow-xl scale-105 z-10" : "border-slate-200"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-accent text-white border-none uppercase text-[10px] font-bold tracking-widest px-3">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-primary mb-2">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground h-8 leading-tight">{plan.desc}</p>
                    <div className="mt-6 flex items-baseline justify-center gap-1">
                      <span className="text-sm font-bold text-slate-400">Rs.</span>
                      <span className="text-4xl font-bold text-primary tracking-tight">
                        {billingCycle === 'monthly' ? plan.monthly.toLocaleString() : plan.yearly.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground text-sm font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 flex-1 border-t border-slate-50 pt-8">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleChoosePlan(plan.id)}
                    className={cn(
                      "w-full h-12 font-bold uppercase tracking-wide gap-2",
                      plan.popular ? "bg-primary text-white" : "variant-outline border-primary text-primary hover:bg-primary/5"
                    )}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    Choose This Plan
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-4xl mx-auto border-t border-slate-100">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-600">
                  <Lock className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Powered by Stripe</p>
                <p className="text-[10px] text-muted-foreground">Card details never touch our servers</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest">256-bit SSL Encryption</p>
                <p className="text-[10px] text-muted-foreground">Your store data is fully encrypted</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-600">
                  <Check className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Cancel Anytime</p>
                <p className="text-[10px] text-muted-foreground">No long term contracts or hidden fees</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

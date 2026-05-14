'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { completeOnboarding } from '@/lib/onboarding/onboarding-actions'
import { toast } from 'sonner'

const plans = [
  {
    id: 'starter',
    name: "Starter",
    monthly: 1499,
    yearly: 14990,
    desc: "For small medical stores starting out.",
    features: [
      "1 User",
      "POS Billing",
      "Inventory + Expiry Tracking",
      "Daily & Monthly Reports",
      "100 Customers",
      "Basic PDF Invoices",
      "Email Support",
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
      "Bulk Price Update",
      "Audit Log",
      "Submit Medicines to Global DB",
      "Chat + Email Support",
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
      "Custom Logo on Receipts",
      "Priority Support",
      "WhatsApp Support",
      "Dedicated Onboarding Call",
    ]
  }
]

export default function OnboardingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkExisting() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check if user already has a profile record
      const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (profile?.tenant_id) {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('status')
          .eq('id', profile.tenant_id)
          .single()

        if (tenant?.status === 'active') {
          router.push('/dashboard')
        } else {
          router.push('/pending-approval')
        }
      } else {
        setChecking(false)
      }
    }
    checkExisting()
  }, [supabase, router])

  const handleSelectPlan = async (planId: string) => {
    setLoadingPlan(planId)
    try {
      const result = await completeOnboarding(planId as any, billingCycle)
      if (result?.error) {
        toast.error(result.error)
        setLoadingPlan(null)
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.")
      setLoadingPlan(null)
    }
  }

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <Link href="/" className="inline-block mb-8">
          <span className="text-3xl font-bold text-[#1E3A5F]">MedPOS</span>
        </Link>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white">
              <Check className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-success">Create Account</span>
          </div>
          <div className="w-12 h-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              2
            </div>
            <span className="text-sm font-medium text-primary">Choose Plan</span>
          </div>
          <div className="w-12 h-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
              3
            </div>
            <span className="text-sm font-medium text-slate-500">Start Using MedPOS</span>
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Start your 14-day free trial today. No payment required right now.
        </p>

        {/* Info Banner */}
        <div className="mt-8 max-w-3xl mx-auto bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-left">
          <span className="text-blue-500 text-xl">ℹ️</span>
          <p className="text-blue-700 text-sm leading-relaxed">
            <strong>How it works:</strong> Select a plan &rarr; We review your account &rarr; Our team contacts you within 2 hours to complete setup. No credit card needed to start.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <span className={cn("text-sm font-medium", billingCycle === 'monthly' ? "text-slate-900" : "text-slate-500")}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            disabled={!!loadingPlan}
            className="w-14 h-8 bg-slate-200 rounded-full p-1 relative transition-colors duration-300"
          >
            <div className={cn(
              "w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300",
              billingCycle === 'yearly' ? "translate-x-6" : "translate-x-0"
            )} />
          </button>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", billingCycle === 'yearly' ? "text-slate-900" : "text-slate-500")}>
              Yearly
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 uppercase text-[10px]">
              Save 2 Months
            </Badge>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "bg-white rounded-2xl p-8 flex flex-col relative transition-all duration-200",
              plan.popular
                ? "border-2 border-primary shadow-xl scale-105 z-10"
                : "border border-slate-200 shadow-sm",
              loadingPlan && loadingPlan !== plan.id ? "opacity-50 pointer-events-none" : ""
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-[#0EA5E9] text-white px-4 py-1 uppercase text-[10px] tracking-widest font-bold border-none">
                  Most Popular
                </Badge>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <p className="text-slate-500 text-sm h-10">{plan.desc}</p>
              <div className="mt-6 flex items-baseline justify-center gap-1">
                <span className="text-sm font-bold text-slate-400">Rs.</span>
                <span className="text-4xl font-bold text-[#1E3A5F] tracking-tight">
                  {billingCycle === 'monthly' ? plan.monthly.toLocaleString() : plan.yearly.toLocaleString()}
                </span>
                <span className="text-slate-500 text-sm">
                  /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 rounded-full p-0.5">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-sm text-slate-600">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              className={cn(
                "w-full h-12 text-md font-bold uppercase tracking-wide",
                plan.popular ? "bg-primary text-white" : ""
              )}
              variant={plan.popular ? 'default' : 'outline'}
              onClick={() => handleSelectPlan(plan.id)}
              disabled={!!loadingPlan}
            >
              {loadingPlan === plan.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Start Free Trial'
              )}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-slate-500 text-sm flex items-center justify-center gap-4">
          <span>✓ 14-day free trial on all plans</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span>✓ Our team will contact you within 2 hours</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span>✓ Cancel anytime</span>
        </p>
      </div>
    </div>
  )
}

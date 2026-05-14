'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, Info, Phone, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/lib/auth/actions'

export default function PendingApprovalPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Use a custom query or direct Supabase fetch
      const { data: profile } = await supabase
        .from('users')
        .select(`
          name,
          tenant_id,
          tenants (
            name,
            plan,
            status,
            trial_ends_at
          )
        `)
        .eq('id', user.id)
        .single()

      if (!profile || !profile.tenant_id) {
        router.push('/onboarding')
        return
      }

      if (profile.tenants.status === 'active') {
        router.push('/dashboard')
        return
      }

      setData(profile)
      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const tenant = data.tenants
  const trialEndDate = tenant.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'N/A'

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Logo */}
      <Link href="/" className="mb-12">
        <span className="text-3xl font-bold text-[#1E3A5F]">MedPOS</span>
      </Link>

      <div className="w-full max-w-lg bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#1E3A5F] p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Account Under Review</h1>
          <p className="text-white/70 mt-1">We're getting everything ready for you</p>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Store Info */}
          <div className="space-y-1 mb-8 pb-8 border-b border-slate-100">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Store:</span>
              <span className="font-bold text-slate-900">{tenant.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Plan:</span>
              <span className="font-bold text-slate-900 capitalize">{tenant.plan}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Trial ends:</span>
              <span className="font-bold text-slate-900">{trialEndDate}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6 mb-10">
            <div className="flex gap-4">
              <div className="relative flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="w-0.5 h-full bg-green-500 absolute top-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-none">Account Created</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="w-0.5 h-full bg-green-500 absolute top-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-none">Plan Selected</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0 z-10 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="w-0.5 h-full bg-slate-200 absolute top-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-600 leading-none">Under Review</p>
                <p className="text-xs text-slate-500 mt-1">Estimated time: 2 hours</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                </div>
                <div className="w-0.5 h-full bg-slate-200 absolute top-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 leading-none">Account Approved</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 leading-none">Start Using MedPOS</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-500 shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-bold text-blue-700">What happens next?</p>
                <ul className="text-xs text-blue-600 space-y-1 list-disc pl-4">
                  <li>Our team reviews your account (usually within 2 hours)</li>
                  <li>We contact you on WhatsApp to complete payment</li>
                  <li>Your 14-day trial starts after approval</li>
                  <li>You get full access to your selected plan</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Box */}
          <div className="text-center space-y-4">
            <p className="text-sm font-medium text-slate-700">Need faster activation?</p>
            <Button
              className="bg-green-500 hover:bg-green-600 text-white w-full h-12 gap-2 text-md font-bold"
              asChild
            >
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="h-5 w-5" />
                WhatsApp Us
              </a>
            </Button>
            <p className="text-xs text-slate-400">
              Support email: <a href="mailto:support@medpos.pk" className="underline">support@medpos.pk</a>
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => signOut()}
        className="mt-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
      >
        <LogOut className="h-4 w-4" />
        Sign out and use different account
      </button>
    </div>
  )
}

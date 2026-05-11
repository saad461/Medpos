'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/shared/logo'
import { CheckCircle2, Loader2, Mail, ArrowRight, AlertCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/use-auth'

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const sessionId = searchParams.get('session_id')

  const [status, setStatus] = useState<'verifying' | 'success' | 'pending' | 'failed'>('verifying')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!user || !sessionId) return

    let attempts = 0
    const maxAttempts = 10
    const intervalTime = 3000

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/checkout/verify?session_id=${sessionId}&user_id=${user.id}`)
        const data = await res.json()

        if (data.status === 'active') {
          setStatus('success')
          setProgress(100)
          return true
        }
        return false
      } catch (err) {
        console.error('Polling error:', err)
        return false
      }
    }

    const interval = setInterval(async () => {
      attempts++
      setProgress((attempts / maxAttempts) * 100)

      const isDone = await pollStatus()
      if (isDone) {
        clearInterval(interval)
      } else if (attempts >= maxAttempts) {
        clearInterval(interval)
        setStatus('pending')
      }
    }, intervalTime)

    pollStatus() // Initial check

    return () => clearInterval(interval)
  }, [user, sessionId])

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="mb-12">
        <Logo className="scale-125" />
      </div>

      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-12 text-center">
        {status === 'verifying' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="h-10 w-10 text-accent animate-spin" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-primary tracking-tight">Verifying your payment...</h1>
              <p className="text-slate-600 leading-relaxed">
                This takes just a moment. Please do not close this page.
              </p>
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure verification in progress</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-8 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center mx-auto shadow-lg shadow-success/20">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-primary tracking-tight">Payment Confirmed! 🎉</h1>
              <p className="text-slate-600 leading-relaxed text-lg">
                Welcome to MedPOS! Your store dashboard is being set up.
              </p>
            </div>

            <div className="bg-success/5 rounded-2xl p-6 text-left space-y-4 border border-success/10">
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Payment confirmed</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                <span>Account under review (usually &lt; 2 hours)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 opacity-60">
                <Mail className="h-4 w-4" />
                <span>Welcome email sent</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="outline" className="flex-1 gap-2 h-12 border-slate-200" asChild>
                <Link href="https://gmail.com" target="_blank">
                  Check Email
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
              <Button className="flex-1 h-12 font-bold shadow-lg" asChild>
                <Link href="/pending-approval">
                  View Account Status
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-10 w-10 text-amber-600" />
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-primary tracking-tight">Payment received — processing...</h1>
              <p className="text-slate-600 leading-relaxed">
                Your payment was received but account setup is taking slightly longer than usual.
                You will receive an email confirmation within 5 minutes.
              </p>
            </div>
            <div className="pt-4 space-y-4">
              <Button className="w-full h-12 font-bold" asChild>
                <Link href="/pending-approval">Go to Status Page</Link>
              </Button>
              <Button variant="ghost" className="w-full text-primary font-bold" asChild>
                <Link href="https://wa.me/92300MEDPOS">Contact WhatsApp Support</Link>
              </Button>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-10 w-10 text-danger" />
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-primary tracking-tight">Verification failed</h1>
              <p className="text-slate-600 leading-relaxed">
                We could not verify your payment. If you were charged, please contact our support team immediately.
              </p>
            </div>
            <div className="pt-4 space-y-4">
              <Button variant="danger" className="w-full h-12 font-bold bg-danger text-white hover:bg-danger/90" asChild>
                <Link href="https://wa.me/92300MEDPOS">Contact Support Now</Link>
              </Button>
              <Button variant="ghost" className="w-full text-primary font-bold" asChild>
                <Link href="/onboarding">Try choosing plan again</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

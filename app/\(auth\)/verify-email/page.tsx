'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthCard } from '@/components/auth/auth-card'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        setStatus('error')
        setErrorMessage(error.message)
      } else if (session) {
        setStatus('success')
        setTimeout(() => {
          router.push('/onboarding?message=verified')
        }, 3000)
      } else {
        // No session yet, might be processing
        setTimeout(checkSession, 1000)
      }
    }

    checkSession()
  }, [router, supabase.auth])

  return (
    <AuthCard
      title={status === 'error' ? 'Verification Failed' : 'Email Verified!'}
      subtitle={status === 'error' ? 'Something went wrong during verification.' : 'Your account has been successfully verified.'}
    >
      <div className="flex flex-col items-center justify-center py-6 space-y-6 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">Finalizing verification...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center animate-in fade-in zoom-in duration-500">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary">Success!</h3>
              <p className="text-muted-foreground leading-relaxed">
                Redirecting you to plan selection...
              </p>
            </div>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/onboarding">Click here if not redirected automatically</Link>
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center">
              <XCircle className="h-10 w-10 text-danger" />
            </div>
            <p className="text-danger font-medium">{errorMessage}</p>
            <Button asChild className="w-full">
              <Link href="/signup">Try again</Link>
            </Button>
          </>
        )}
      </div>
    </AuthCard>
  )
}

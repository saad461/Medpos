import { Metadata } from 'next'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'
import { LoginForm } from '@/components/auth/login-form'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { Separator } from '@/components/ui/separator'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Sign In — MedPOS',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { demo?: string }
}) {
  const isDemo = searchParams.demo === 'true'

  return (
    <AuthCard
      title="Sign in to your store"
      subtitle="Enter your details below to access your dashboard."
      footer={
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            Start Free Trial →
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <GoogleAuthButton label="Continue with Google" />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground font-bold tracking-widest">Or sign in with email</span>
          </div>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm isDemo={isDemo} />
        </Suspense>
      </div>
    </AuthCard>
  )
}

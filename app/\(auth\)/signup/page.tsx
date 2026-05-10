import { Metadata } from 'next'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'
import { SignupForm } from '@/components/auth/signup-form'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Create Account — MedPOS',
  description: 'Start your free 14-day trial. No credit card required.',
}

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Start your free 14-day trial in under 60 seconds."
      footer={
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign In →
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="bg-success/10 border border-success/20 rounded-xl p-3 flex items-center gap-3 text-success text-xs font-bold uppercase tracking-wide">
          <CheckCircle2 className="h-4 w-4" />
          ✓ 14-day free trial — no credit card required
        </div>

        <GoogleAuthButton label="Sign up with Google" />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground font-bold tracking-widest">Or continue with email</span>
          </div>
        </div>

        <SignupForm />
      </div>
    </AuthCard>
  )
}

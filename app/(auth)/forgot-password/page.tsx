import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-8">
            <span className="text-3xl font-bold text-primary">MedPOS</span>
          </Link>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Forgot Password?</h1>
          <p className="text-muted-foreground mt-2">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <ForgotPasswordForm />
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

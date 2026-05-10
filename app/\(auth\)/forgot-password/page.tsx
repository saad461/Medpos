import { Metadata } from 'next'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Forgot Password — MedPOS',
}

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot Password?"
      subtitle="Enter your email and we will send you a reset link."
      footer={
        <Link href="/login" className="text-sm text-primary font-bold hover:underline flex items-center justify-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}

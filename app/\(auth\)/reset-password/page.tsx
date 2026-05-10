import { Metadata } from 'next'
import { AuthCard } from '@/components/auth/auth-card'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Reset Password — MedPOS',
}

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Create New Password"
      subtitle="Enter a new strong password for your account."
    >
      <ResetPasswordForm />
    </AuthCard>
  )
}

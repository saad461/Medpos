'use client'

import { AlertTriangle, Phone, Mail, LogOut, CreditCard, LifeBuoy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth/actions'
import Link from 'next/link'

export default function SuspendedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-surface">
      <div className="max-w-3xl w-full space-y-12">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-danger" />
          </div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">Account Suspended</h1>
          <p className="text-lg text-slate-600 max-w-lg mx-auto">
            Your account has been suspended. This may be due to a payment issue or a policy violation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 flex flex-col space-y-6">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary">Payment Problem?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your last payment may have failed. Update your payment method to reactivate your dashboard immediately.
              </p>
            </div>
            <Button className="w-full gap-2 mt-auto" asChild>
              <Link href="/login">Update Payment Method</Link>
            </Button>
          </div>

          <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 flex flex-col space-y-6">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center text-success">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary">Need Help?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                If you believe this is an error or have questions about your suspension, contact our support team.
              </p>
            </div>
            <div className="flex flex-col gap-3 mt-auto">
              <Button variant="outline" className="w-full gap-2 border-slate-200">
                <Phone className="h-4 w-4" />
                WhatsApp Support
              </Button>
              <Button variant="ghost" className="w-full gap-2 text-primary font-bold">
                <Mail className="h-4 w-4" />
                Email support@medpos.pk
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => signOut()}
            className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

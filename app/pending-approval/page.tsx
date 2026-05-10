'use client'

import { Clock, Phone, Mail, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth/actions'
import { useAuth } from '@/hooks/use-auth'

export default function PendingApprovalPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-surface">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-12 text-center space-y-8">
          <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Clock className="h-12 w-12 text-accent" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-primary tracking-tight">Your Account is Being Reviewed</h1>
            <p className="text-slate-600 leading-relaxed">
              Our team is reviewing your subscription for <span className="font-bold text-primary">{user?.user_metadata?.store_name || "your store"}</span>.
              This usually takes less than 2 hours during business hours (9 AM - 11 PM Pakistan time).
            </p>
          </div>

          <div className="bg-accent/5 rounded-2xl p-8 text-left space-y-6 border border-accent/10">
            <h4 className="font-bold text-primary uppercase text-xs tracking-widest">What happens next?</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-success text-[10px]">✓</div>
                We verify your subscription payment
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-success text-[10px]">✓</div>
                Your store dashboard is activated
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-success text-[10px]">✓</div>
                You receive a confirmation email
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-success text-[10px]">✓</div>
                You can start adding medicines and billing
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Need faster activation? Contact us:</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 gap-2 bg-[#25D366] hover:bg-[#20ba56] border-none shadow-md">
                  <Phone className="h-4 w-4" />
                  WhatsApp Us
                </Button>
                <Button variant="outline" className="flex-1 gap-2 border-slate-200">
                  <Mail className="h-4 w-4" />
                  Email Support
                </Button>
              </div>
            </div>

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
    </div>
  )
}

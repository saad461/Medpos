'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lock, Copy, Check, AlertTriangle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { DEMO_CREDENTIALS } from '@/lib/demo-seed'
import { cn } from '@/lib/utils'

export function DemoCredentials() {
  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard!`)
    } else {
      toast.error("Copy failed. Please select and copy manually.")
    }
  }

  return (
    <section id="demo-credentials" className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto border-2 border-primary rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-700">
          {/* Header Bar */}
          <div className="bg-primary px-8 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 opacity-70" />
              <span className="font-bold tracking-wide">Demo Login Credentials</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Live System</span>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-primary">Log in to explore the full dashboard</h3>
              <p className="text-muted-foreground leading-relaxed">
                Use these credentials to access a real demo store with sample data.
                Everything works — billing, inventory, reports, and more.
              </p>
            </div>

            <div className="space-y-4">
              <CredentialRow
                label="Demo URL"
                value="app.medpos.pk/login"
                onCopy={() => copyToClipboard(DEMO_CREDENTIALS.url, "Login URL")}
              />
              <div className="h-px bg-slate-100" />
              <CredentialRow
                label="Email Address"
                value={DEMO_CREDENTIALS.email}
                onCopy={() => copyToClipboard(DEMO_CREDENTIALS.email, "Email")}
              />
              <div className="h-px bg-slate-100" />
              <CredentialRow
                label="Password"
                value={DEMO_CREDENTIALS.password}
                onCopy={() => copyToClipboard(DEMO_CREDENTIALS.password, "Password")}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800 leading-relaxed font-medium">
                Demo data resets every 24 hours. Any changes you make (sales, inventory adjustments) will be cleared automatically at midnight.
              </p>
            </div>

            <div className="space-y-4">
              <Button className="w-full h-14 text-lg font-bold gap-2 group shadow-lg" asChild>
                <Link href="/login?demo=true">
                  Open Demo Dashboard
                  <ExternalLink className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <div className="text-center text-sm text-muted-foreground pt-2">
                Or — Start your own free 14-day trial instead.{' '}
                <Link href="/signup" className="text-primary font-bold hover:underline">
                  Create Free Account →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CredentialRow({ label, value, onCopy }: { label: string, value: string, onCopy: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 group">
      <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-3">
        <code className="text-primary font-mono text-lg font-bold select-all bg-slate-50 px-2 py-1 rounded">
          {value}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 hover:bg-slate-100", copied && "text-success")}
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

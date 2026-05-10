import Link from 'next/link'
import { Info } from 'lucide-react'

export function DemoBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 space-y-1">
      <div className="flex items-center gap-2 text-amber-700">
        <Info className="h-4 w-4" />
        <span className="font-bold text-sm tracking-tight">You are viewing the MedPOS demo account</span>
      </div>
      <p className="text-xs text-amber-700/80 leading-relaxed font-medium pl-6">
        Pre-filled with demo credentials. Sign in to explore the full dashboard.{' '}
        <Link href="/signup" className="text-amber-800 font-bold hover:underline">
          Want your own store? Start free trial →
        </Link>
      </p>
    </div>
  )
}

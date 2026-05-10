import Link from 'next/link'
import { Logo } from '@/components/shared/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative py-12 px-4">
      {/* Background with Grid Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-accent/5 -z-20" />
      <div
        className="absolute inset-0 opacity-[0.03] -z-10"
        style={{ backgroundImage: 'radial-gradient(#1E3A5F 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="w-full max-w-[440px] flex flex-col items-center space-y-8">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <Logo className="scale-125" />
        </Link>

        <div className="w-full">
          {children}
        </div>

        <footer className="text-center space-y-4 pt-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MedPOS. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground justify-center">
            <Link href="#" className="hover:underline">Privacy Policy</Link>
            <Link href="#" className="hover:underline">Terms of Service</Link>
          </div>
        </footer>
      </div>
    </div>
  )
}

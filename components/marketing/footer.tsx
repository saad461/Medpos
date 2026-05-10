import Link from 'next/link'
import { Logo } from '@/components/shared/logo'
import { Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-white/70 py-16 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          {/* Column 1 - Brand */}
          <div className="space-y-6">
            <Logo variant="white" />
            <p className="text-sm leading-relaxed max-w-xs">
              Cloud-based medical store management system built specifically for Pakistani pharmacies.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-accent" />
                <span>0300-XXXXXXX (Placeholder)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-accent" />
                <span>support@medpos.pk</span>
              </div>
            </div>
          </div>

          {/* Column 2 - Product */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Product</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#features" className="hover:text-accent transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-accent transition-colors">Pricing</Link></li>
              <li><Link href="/demo" className="hover:text-accent transition-colors">Demo</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Changelog</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Roadmap</Link></li>
            </ul>
          </div>

          {/* Column 3 - Support */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Support</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#" className="hover:text-accent transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">WhatsApp Support</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Email Support</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Tutorial Videos (Urdu)</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Knowledge Base</Link></li>
            </ul>
          </div>

          {/* Column 4 - Legal */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Refund Policy</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs tracking-wide">
          <p>© {currentYear} MedPOS. All rights reserved.</p>
          <p>Made with ❤️ for Pakistani Pharmacies</p>
          <p className="flex items-center gap-2">
            Powered by Vercel + Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Demo', href: '/demo' },
  { name: 'Support', href: '#faq' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getHref = (href: string) => {
    if (pathname !== '/' && href.startsWith('#')) {
      return `/${href}`
    }
    return href
  }

  return (
    <nav
      className={cn(
        "fixed top-0 w-full h-16 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-slate-200 py-0"
          : "bg-white border-transparent py-1"
      )}
    >
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        {/* Left Side: Logo */}
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <Logo />
        </Link>

        {/* Center: Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={getHref(link.href)}
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Side: Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Start Free Trial</Link>
          </Button>
        </div>

        {/* Mobile: Hamburger Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="text-left mb-8">
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={getHref(link.href)}
                    className="text-lg font-medium text-slate-600 hover:text-primary py-2 border-b border-slate-100"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-3 pt-4">
                  <Button variant="outline" className="w-full justify-center" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button className="w-full justify-center" asChild>
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                </div>

                <div className="mt-auto pt-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-2">
                    <Phone className="h-4 w-4" />
                    <span>WhatsApp Support</span>
                  </div>
                  <p className="font-bold text-primary">0300-MEDPOS</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

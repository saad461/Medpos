'use client'

import {
  ShoppingCart,
  Package,
  Database,
  Scan,
  BarChart3,
  Bell,
  Users,
  Globe
} from 'lucide-react'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: ShoppingCart,
    name: "Fast POS Billing",
    desc: "Bill a customer in under 10 seconds. Search medicines, add to cart, print receipt. Barcode scanner supported."
  },
  {
    icon: Package,
    name: "Smart Inventory",
    desc: "Track stock levels, expiry dates, and get automatic alerts before you run out or medicines expire."
  },
  {
    icon: Database,
    name: "3,000+ Pakistan Medicines",
    desc: "DRAP-sourced medicine database pre-loaded. Search by name, set your own price per medicine."
  },
  {
    icon: Scan,
    name: "Barcode Scanner",
    desc: "Plug in any USB barcode scanner. Scan medicine barcodes to instantly add to sale or find in inventory."
  },
  {
    icon: BarChart3,
    name: "Sales & Profit Reports",
    desc: "Daily, weekly, monthly sales reports. Profit & loss, top medicines, and export to PDF or CSV."
  },
  {
    icon: Bell,
    name: "Expiry & Stock Alerts",
    desc: "Automatic email alerts for medicines expiring in 7, 30, or 90 days. Never lose money on expired stock."
  },
  {
    icon: Users,
    name: "Multi-User Roles",
    desc: "Owner, pharmacist, cashier — each with their own login and permissions. Full audit log of every action."
  },
  {
    icon: Globe,
    name: "Access from Anywhere",
    desc: "Cloud-based — check your sales, stock, and reports from your phone, tablet, or laptop anywhere in Pakistan."
  }
]

export function Features() {
  const { targetRef, isIntersecting } = useIntersectionObserver()

  return (
    <section id="features" className="py-24 bg-surface" ref={targetRef}>
      <div className="container mx-auto px-4 text-center mb-16">
        <p className="text-accent text-sm font-bold tracking-widest uppercase mb-4">
          Everything You Need
        </p>
        <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">
          One Dashboard. Complete Control.
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Everything a modern Pakistani pharmacy needs, built into one simple cloud system.
        </p>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, i) => (
          <FeatureCard
            key={feature.name}
            feature={feature}
            index={i}
            isVisible={isIntersecting}
          />
        ))}
      </div>
    </section>
  )
}

function FeatureCard({ feature, index, isVisible }: { feature: any, index: number, isVisible: boolean }) {
  const Icon = feature.icon

  return (
    <div
      className={cn(
        "bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
        <Icon className="h-7 w-7 text-accent" />
      </div>
      <h3 className="text-xl font-bold text-primary mb-3">
        {feature.name}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {feature.desc}
      </p>
    </div>
  )
}

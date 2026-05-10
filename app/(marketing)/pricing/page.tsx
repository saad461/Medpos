import { Metadata } from 'next'
import { PricingCards } from '@/components/marketing/pricing-cards'
import { Check, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Pricing — MedPOS',
  description: 'MedPOS pricing plans for Pakistani pharmacies. Starter Rs.1,499/mo, Professional Rs.2,999/mo, Business Rs.5,499/mo. 14-day free trial.',
}

const comparisonData = [
  { category: "BILLING", features: [
    { name: "POS Billing", starter: true, pro: true, biz: true },
    { name: "Barcode Scanner Support", starter: true, pro: true, biz: true },
    { name: "Invoice PDF Generation", starter: true, pro: true, biz: true },
    { name: "Cash / Card / Credit Payment", starter: true, pro: true, biz: true },
    { name: "Discount (per item + order level)", starter: true, pro: true, biz: true },
    { name: "Return / Refund Processing", starter: true, pro: true, biz: true },
    { name: "Hold & Resume Sale", starter: true, pro: true, biz: true },
    { name: "Keyboard Shortcuts", starter: true, pro: true, biz: true },
  ]},
  { category: "INVENTORY", features: [
    { name: "Medicine Search (3,000+ Pakistan DB)", starter: true, pro: true, biz: true },
    { name: "Add & Edit Medicines", starter: true, pro: true, biz: true },
    { name: "Stock Tracking", starter: true, pro: true, biz: true },
    { name: "Expiry Date Tracking", starter: true, pro: true, biz: true },
    { name: "Expiry Alerts (7/30/90 days)", starter: true, pro: true, biz: true },
    { name: "Low Stock Alerts", starter: true, pro: true, biz: true },
    { name: "Bulk Price Update", starter: false, pro: true, biz: true },
    { name: "CSV Import & Export", starter: false, pro: true, biz: true },
    { name: "Submit Medicine to Global DB", starter: false, pro: true, biz: true },
  ]},
  { category: "USERS", features: [
    { name: "Number of Users", starter: "1", pro: "5", biz: "15" },
    { name: "Role-Based Access", starter: false, pro: true, biz: true },
    { name: "Audit Log", starter: false, pro: true, biz: true },
  ]},
  { category: "REPORTS", features: [
    { name: "Daily & Monthly Sales", starter: true, pro: true, biz: true },
    { name: "Weekly Reports", starter: false, pro: true, biz: true },
    { name: "Profit & Loss Report", starter: false, pro: true, biz: true },
    { name: "Medicine-wise Sales", starter: false, pro: true, biz: true },
    { name: "Customer Report", starter: false, pro: true, biz: true },
    { name: "GST/Tax Report", starter: false, pro: true, biz: true },
    { name: "PDF + CSV Export", starter: false, pro: true, biz: true },
  ]},
  { category: "CUSTOMERS & SUPPLIERS", features: [
    { name: "Customer Management", starter: "100", pro: "Unlimited", biz: "Unlimited" },
    { name: "Supplier Management", starter: false, pro: true, biz: true },
    { name: "Purchase Orders", starter: false, pro: true, biz: true },
  ]},
  { category: "SUPPORT", features: [
    { name: "Email Support", starter: true, pro: true, biz: true },
    { name: "Chat Support", starter: false, pro: true, biz: true },
    { name: "WhatsApp Support", starter: false, false: true, biz: true },
    { name: "Priority Support", starter: false, pro: false, biz: true },
  ]}
]

export default function PricingPage() {
  return (
    <div className="flex flex-col py-24">
      <div className="container mx-auto px-4 text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground text-xl">No hidden fees. No setup costs. Cancel anytime.</p>
      </div>

      <PricingCards />

      <div className="container mx-auto px-4 mt-24">
        <h2 className="text-3xl font-bold text-primary mb-12 text-center">Full Feature Comparison</h2>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[300px] font-bold text-primary py-6">Feature</TableHead>
                <TableHead className="text-center font-bold text-primary">Starter</TableHead>
                <TableHead className="text-center font-bold text-primary bg-primary/5">Professional</TableHead>
                <TableHead className="text-center font-bold text-primary">Business</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((group) => (
                <React.Fragment key={group.category}>
                  <TableRow className="bg-surface hover:bg-surface border-y border-slate-100">
                    <TableCell colSpan={4} className="font-bold text-primary py-4 px-6 text-xs tracking-widest uppercase">
                      {group.category}
                    </TableCell>
                  </TableRow>
                  {group.features.map((feature) => (
                    <TableRow key={feature.name} className="hover:bg-slate-50/30 transition-colors">
                      <TableCell className="font-medium text-slate-700 py-4 px-6 sticky left-0 bg-white md:relative">
                        {feature.name}
                      </TableCell>
                      <TableCell className="text-center">{renderValue(feature.starter)}</TableCell>
                      <TableCell className="text-center bg-primary/5">{renderValue(feature.pro)}</TableCell>
                      <TableCell className="text-center">{renderValue(feature.biz)}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

function renderValue(value: any) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-success mx-auto" />
    ) : (
      <X className="h-5 w-5 text-slate-300 mx-auto" />
    )
  }
  return <span className="text-sm font-semibold text-slate-700">{value}</span>
}

import * as React from 'react';

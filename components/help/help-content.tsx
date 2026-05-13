'use client'

import {
  Play,
  MessageCircle,
  Phone,
  Map,
  ExternalLink,
  BookOpen,
  Pill,
  ShoppingCart,
  Printer,
  UserPlus,
  BarChart3,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  TUTORIAL_VIDEO_URL,
  SUPPORT_WHATSAPP_URL,
  SUPPORT_EMAIL,
  SUPPORT_HOURS,
  SUPPORT_WHATSAPP
} from "@/lib/constants"
import { FAQ_ITEMS } from "@/lib/faq"
import { GuidedTour } from "@/components/onboarding/guided-tour"
import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function HelpContent() {
  const [startTour, setStartTour] = useState(false)

  const quickActions = [
    {
      title: "Video Tutorial",
      description: "Complete 12-minute walkthrough of all features",
      icon: Play,
      iconColor: "text-accent",
      iconBg: "bg-accent/10",
      action: "Watch Now →",
      href: TUTORIAL_VIDEO_URL,
      target: "_blank"
    },
    {
      title: "Live Chat Support",
      description: "Average response: 15 min • Available 9 AM - 11 PM",
      icon: MessageCircle,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      action: "Start Chat →",
      onClick: () => (window as any).$crisp?.push(['do', 'chat:open'])
    },
    {
      title: "WhatsApp Us",
      description: "Send us a message on WhatsApp for quick help",
      icon: Phone,
      iconColor: "text-[#25D366]",
      iconBg: "bg-[#25D366]/10",
      action: "Open WhatsApp →",
      href: SUPPORT_WHATSAPP_URL,
      target: "_blank"
    },
    {
      title: "Guided Tour",
      description: "Replay the getting started tour of the dashboard",
      icon: Map,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      action: "Start Tour →",
      onClick: () => setStartTour(true)
    }
  ]

  const docLinks = [
    { title: "How to Add Medicines", icon: Pill },
    { title: "How to Make a Sale", icon: ShoppingCart },
    { title: "How to Print Receipts", icon: Printer },
    { title: "How to Add Team Members", icon: UserPlus },
    { title: "How to View Reports", icon: BarChart3 },
    { title: "How to Submit a Medicine", icon: FileText },
  ]

  return (
    <div className="space-y-12 pb-20">
      {startTour && (
        <GuidedTour
          autoStart={true}
          onComplete={() => setStartTour(false)}
          onSkip={() => setStartTour(false)}
        />
      )}

      <section>
        <h2 className="text-xl font-bold text-primary mb-6">Quick Help</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((item, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden group" onClick={item.onClick}>
              <CardContent className="p-6">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", item.iconBg)}>
                  <item.icon className={cn("w-6 h-6", item.iconColor)} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground mb-4 min-h-[32px]">{item.description}</p>
                {item.href ? (
                  <Button variant="link" className="p-0 h-auto text-primary font-semibold" asChild>
                    <Link href={item.href} target={item.target}>{item.action}</Link>
                  </Button>
                ) : (
                  <button className="text-primary text-sm font-semibold hover:underline" onClick={item.onClick}>
                    {item.action}
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 rounded-3xl p-8 lg:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-primary mb-2">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about using MedPOS</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {FAQ_ITEMS.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="bg-white border rounded-xl px-6">
                <AccordionTrigger className="hover:no-underline font-semibold text-slate-900 py-4 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary">Documentation</h2>
          <Button variant="outline" size="sm" className="gap-2">
            <BookOpen className="w-4 h-4" />
            View Full Docs
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docLinks.map((doc, idx) => (
            <Link key={idx} href="/dashboard/help" className="flex items-center p-4 border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center mr-4 transition-colors">
                <doc.icon className="w-5 h-5 text-slate-500 group-hover:text-primary" />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-primary">{doc.title}</span>
              <ExternalLink className="w-3 h-3 ml-auto text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t pt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-bold text-primary mb-2 uppercase text-xs tracking-widest">Email Support</h4>
            <p className="text-slate-600 text-sm font-medium">{SUPPORT_EMAIL}</p>
          </div>
          <div>
            <h4 className="font-bold text-primary mb-2 uppercase text-xs tracking-widest">WhatsApp Support</h4>
            <p className="text-slate-600 text-sm font-medium">+{SUPPORT_WHATSAPP}</p>
          </div>
          <div>
            <h4 className="font-bold text-primary mb-2 uppercase text-xs tracking-widest">Business Hours</h4>
            <p className="text-slate-600 text-sm font-medium">{SUPPORT_HOURS}</p>
          </div>
        </div>
      </section>
    </div>
  )
}

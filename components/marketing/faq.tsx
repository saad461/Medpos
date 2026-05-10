'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"

const faqs = [
  {
    q: "Do I need to install any software?",
    a: "No. MedPOS is completely cloud-based. It works in any web browser on your computer, tablet, or phone. Nothing to install, nothing to update — it just works."
  },
  {
    q: "How does the medicine database work?",
    a: "MedPOS comes with 3,000+ Pakistan medicines from DRAP already loaded. You search for a medicine, add it to your store, and set your own sale price. Your price is private to your store — other stores cannot see it."
  },
  {
    q: "Can I set my own prices for medicines?",
    a: "Yes, absolutely. Every store sets their own prices independently. A medicine might be Rs. 15 in Lahore and Rs. 17 in Karachi — both are correct. DRAP MRP is shown as a reference only."
  },
  {
    q: "What happens after I pay? How do I get access?",
    a: "The moment your payment is confirmed, your store dashboard is created automatically and a welcome email is sent to you with your login details — all within 60 seconds. No waiting, no manual steps."
  },
  {
    q: "Does the barcode scanner work with any scanner?",
    a: "Yes. Any standard USB barcode scanner works with MedPOS. Just plug it in and scan — it automatically finds the medicine and adds it to the sale."
  },
  {
    q: "What if the medicine I need is not in the database?",
    a: "You can add any medicine manually with your own details and price. You can also submit it to our global database for review — if approved, it becomes available to all MedPOS users."
  },
  {
    q: "Is my store data safe and private?",
    a: "Yes. Every store's data is completely isolated. Store A can never see Store B's data, prices, customers, or sales. All data is encrypted and backed up daily."
  },
  {
    q: "Can I use MedPOS on my mobile phone?",
    a: "Yes. MedPOS works on any device with a browser — phone, tablet, laptop, or desktop. An Android app is also coming soon."
  },
  {
    q: "What if I want to cancel my subscription?",
    a: "You can cancel anytime from your dashboard. You keep access until the end of your billing period. Your data is preserved for 90 days after cancellation."
  },
  {
    q: "Is there support available in Urdu?",
    a: "Yes. Our tutorial videos are in Urdu. WhatsApp support is available in both Urdu and English. Our team is based in Pakistan."
  }
]

export function FAQ() {
  const { targetRef, isIntersecting } = useIntersectionObserver()

  return (
    <section id="faq" className="py-24 bg-surface" ref={targetRef}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know before getting started.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className={cn(
                "bg-white rounded-xl border border-slate-200 px-6 transition-all duration-700 ease-out",
                isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <AccordionTrigger className="text-left font-bold text-primary hover:no-underline py-6">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed pb-6">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

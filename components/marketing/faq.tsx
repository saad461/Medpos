'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"
import { FAQ_ITEMS } from "@/lib/faq"

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
          {FAQ_ITEMS.map((faq, i) => (
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
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

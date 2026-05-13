import { HelpContent } from "@/components/help/help-content"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Help & Support | MedPOS",
  description: "Find tutorials, FAQs, and contact MedPOS support.",
}

export default function HelpPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Help & Support</h1>
        <p className="text-muted-foreground mt-1">Find answers and get assistance for your pharmacy.</p>
      </div>
      <HelpContent />
    </div>
  )
}

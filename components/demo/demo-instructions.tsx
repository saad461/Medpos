import { LogIn, ShoppingCart, Package, BarChart3, Plus, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  {
    icon: LogIn,
    title: "Log In to the Demo",
    desc: "Go to app.medpos.pk/login and enter the demo credentials shown above. You will land on the dashboard overview showing today's sales, stock alerts, and quick actions."
  },
  {
    icon: ShoppingCart,
    title: "Make a Test Sale (POS)",
    desc: "Click 'POS Billing' in the sidebar. Type 'Panadol' in the search box — it appears instantly. Click to add to cart. Add a few more medicines. Click Checkout, select Cash payment, and generate a PDF receipt. The whole process takes under 30 seconds."
  },
  {
    icon: Package,
    title: "Check Your Inventory",
    desc: "Click 'Inventory' in the sidebar. See all 50 pre-loaded medicines with their stock levels, expiry dates, and status badges. Notice 3 medicines are marked 'Expiring Soon' in yellow — click one to see details."
  },
  {
    icon: BarChart3,
    title: "View Sales Reports",
    desc: "Click 'Reports' in the sidebar. See 30 days of pre-loaded sales data in charts. Switch between Daily, Weekly, and Monthly views. Click 'Export CSV' to download the data."
  },
  {
    icon: Plus,
    title: "Add a New Medicine",
    desc: "In Inventory, click 'Add Medicine'. Search for any Pakistan medicine by name. Set your own sale price, stock quantity, and expiry date. Your price is private to your store."
  },
  {
    icon: Settings,
    title: "Check Store Settings",
    desc: "Click 'Settings' in the sidebar. See how to customize your store name, receipt header, GST rate, and upload your logo. These settings print on every invoice."
  }
]

export function DemoInstructions() {
  return (
    <section className="bg-surface py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">How to Explore the Demo</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Follow these steps to see everything MedPOS can do for your pharmacy.
          </p>
        </div>

        <div className="relative pl-8 sm:pl-16 space-y-16">
          {/* Vertical Timeline Line */}
          <div className="absolute left-10 sm:left-20 top-0 bottom-0 w-0.5 bg-primary/10 -translate-x-1/2" />

          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-8 sm:-left-16 top-1.5 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg z-10 shadow-lg border-4 border-white group-hover:scale-110 transition-transform">
                {i + 1}
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-primary">{step.title}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

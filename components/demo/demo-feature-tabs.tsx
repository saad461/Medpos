'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Search, ShoppingCart, AlertTriangle, Info, Bell, CheckCircle2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function DemoFeatureTabs() {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">Every Feature, Explained</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Click each tab to see exactly what MedPOS does and how it works.
          </p>
        </div>

        <Tabs defaultValue="pos" className="w-full max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto bg-slate-100/50 p-1 mb-12">
            <TabsTrigger value="pos" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">POS Billing</TabsTrigger>
            <TabsTrigger value="inventory" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Inventory</TabsTrigger>
            <TabsTrigger value="reports" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Reports</TabsTrigger>
            <TabsTrigger value="alerts" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Alerts</TabsTrigger>
            <TabsTrigger value="settings" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Settings</TabsTrigger>
          </TabsList>

          {/* POS BILLING */}
          <TabsContent value="pos" className="animate-in fade-in-50 duration-500">
            <FeatureLayout
              title="Bill Customers in Seconds"
              description="The POS screen is designed for speed. Your cashier can process a full sale without touching the mouse."
              bullets={[
                "Real-time medicine search — type 3 letters, results appear",
                "USB barcode scanner supported — scan and auto-add",
                "Per-item and order-level discounts",
                "Cash change calculator built in",
                "PDF invoice generated automatically",
                "Print or WhatsApp receipt to customer",
                "Return and refund processing",
                "Keyboard shortcuts for speed (F2, F8, F10)"
              ]}
              mockup={<POSMockup />}
            />
          </TabsContent>

          {/* INVENTORY */}
          <TabsContent value="inventory" className="animate-in fade-in-50 duration-500">
            <FeatureLayout
              title="Complete Inventory Control"
              description="Track every medicine in your store with stock levels, expiry dates, and automatic alerts."
              bullets={[
                "3,000+ Pakistan medicines pre-loaded from DRAP",
                "Set your own sale price per medicine",
                "Expiry date tracking with color-coded badges",
                "Low stock alerts when below reorder level",
                "Bulk price update by category",
                "CSV import and export",
                "Profit margin shown per medicine",
                "Submit private medicines for global database"
              ]}
              mockup={<InventoryMockup />}
            />
          </TabsContent>

          {/* REPORTS */}
          <TabsContent value="reports" className="animate-in fade-in-50 duration-500">
            <FeatureLayout
              title="Know Your Business Numbers"
              description="Complete sales analytics, profit tracking, and export options for every period."
              bullets={[
                "Daily, weekly, monthly sales charts",
                "Profit & Loss with COGS calculation",
                "Top selling medicines ranked",
                "Customer purchase history",
                "Supplier purchase reports",
                "GST/Tax summary for FBR",
                "Export any report to PDF or CSV",
                "Shift-wise cashier reports"
              ]}
              mockup={<ReportsMockup />}
            />
          </TabsContent>

          {/* ALERTS */}
          <TabsContent value="alerts" className="animate-in fade-in-50 duration-500">
            <FeatureLayout
              title="Never Miss an Expiry or Stock Issue"
              description="Automatic alerts keep you informed before problems become losses."
              bullets={[
                "Expiry alerts: 90, 30, and 7 days before",
                "Critical alert on expiry date (red banner)",
                "Low stock alert when below reorder level",
                "Weekly email digest of stock issues",
                "Daily automatic expiry check (8 AM)",
                "In-app notification center",
                "DRAP price update notifications monthly",
                "Subscription renewal reminders"
              ]}
              mockup={<AlertsMockup />}
            />
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings" className="animate-in fade-in-50 duration-500">
            <FeatureLayout
              title="Customize Your Store"
              description="Make MedPOS match your store's identity and requirements."
              bullets={[
                "Store name, address, and phone number",
                "Upload your store logo (prints on receipts)",
                "Custom receipt header and footer text",
                "GST rate configuration (0% default)",
                "Light and dark mode",
                "Invite team members by email",
                "Set roles: Owner, Admin, Pharmacist, Cashier",
                "View full audit log of all changes"
              ]}
              mockup={<SettingsMockup />}
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

function FeatureLayout({ title, description, bullets, mockup }: { title: string, description: string, bullets: string[], mockup: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-slate-50/50 rounded-3xl p-8 md:p-12 border border-slate-100">
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-3xl font-bold text-primary tracking-tight">{title}</h3>
          <p className="text-lg text-slate-600 leading-relaxed">{description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bullets.map((bullet, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1 bg-success/10 rounded-full p-0.5">
                <Check className="h-3.5 w-3.5 text-success" />
              </div>
              <span className="text-sm font-medium text-slate-700">{bullet}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[400px]">
        {mockup}
      </div>
    </div>
  )
}

function POSMockup() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-slate-50 flex items-center gap-4">
        <div className="flex-1 bg-white border border-slate-200 rounded px-3 py-2 flex items-center gap-2 text-sm text-slate-400">
          <Search className="h-4 w-4" />
          Panadol
        </div>
      </div>
      <div className="flex-1 grid grid-cols-12">
        <div className="col-span-8 p-4 space-y-4 border-r">
          <div className="bg-white border-2 border-accent rounded-xl p-4 shadow-sm space-y-1">
            <div className="flex justify-between items-start">
              <span className="font-bold text-primary">Panadol 500mg</span>
              <span className="text-accent font-bold">Rs. 3.50</span>
            </div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Stock: 240 units</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-1 opacity-60">
            <div className="flex justify-between items-start">
              <span className="font-bold text-primary">Panadol Extra</span>
              <span className="text-accent font-bold">Rs. 5.00</span>
            </div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Stock: 80 units</p>
          </div>
        </div>
        <div className="col-span-4 bg-slate-50/50 flex flex-col">
          <div className="p-4 border-b bg-white">
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Current Sale</h4>
          </div>
          <div className="flex-1 p-4 space-y-3">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Panadol 500mg <span className="text-muted-foreground">x3</span></span>
              <span className="font-bold">10.50</span>
            </div>
          </div>
          <div className="p-4 bg-white border-t space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-400">TOTAL</span>
              <span className="text-xl font-bold text-primary">Rs. 10.50</span>
            </div>
            <button className="w-full bg-success text-white py-3 rounded-lg font-bold text-sm shadow-sm">Checkout</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InventoryMockup() {
  return (
    <div className="p-6">
      <div className="space-y-4">
        <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-4">
          <div className="col-span-5">Medicine</div>
          <div className="col-span-2 text-center">Stock</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-3 text-right">Status</div>
        </div>
        {[
          { name: 'Panadol 500mg', stock: 240, price: '3.50', exp: 'Dec 2027', status: 'In Stock', color: 'bg-success/10 text-success' },
          { name: 'Augmentin 625', stock: 8, price: '90.00', exp: 'Mar 2025', status: 'Low Stock', color: 'bg-warning/10 text-warning' },
          { name: 'Disprin 300mg', stock: 0, price: '3.00', exp: 'Jun 2027', status: 'Out of Stock', color: 'bg-danger/10 text-danger' },
        ].map((row, i) => (
          <div key={i} className="grid grid-cols-12 items-center py-4 border-b border-slate-50 last:border-0">
            <div className="col-span-5">
              <p className="font-bold text-sm text-primary">{row.name}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Exp: {row.exp}</p>
            </div>
            <div className="col-span-2 text-center font-bold text-sm text-slate-600">{row.stock}</div>
            <div className="col-span-2 text-center font-mono text-sm text-slate-600">{row.price}</div>
            <div className="col-span-3 text-right">
              <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter", row.color)}>
                {row.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReportsMockup() {
  const bars = [40, 35, 65, 50, 85, 75, 55]
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return (
    <div className="p-8 h-full flex flex-col">
      <h4 className="font-bold text-primary mb-2">This Week's Sales</h4>
      <p className="text-2xl font-bold text-accent mb-8">Rs. 20,600</p>

      <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-6 border-b border-slate-100">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-3">
            <div
              className="w-full bg-accent/20 border-t-4 border-accent rounded-t-sm transition-all duration-1000"
              style={{ height: `${h}%` }}
            />
            <span className="text-[10px] font-bold text-slate-400 uppercase">{days[i]}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Daily</p>
          <p className="font-bold text-primary">Rs. 2,942</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Top Store</p>
          <p className="font-bold text-primary">Lahore</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Growth</p>
          <p className="font-bold text-success">+12%</p>
        </div>
      </div>
    </div>
  )
}

function AlertsMockup() {
  return (
    <div className="p-6 space-y-4">
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Expiring Soon</span>
        </div>
        <div className="space-y-1">
          <p className="font-bold text-slate-800">Augmentin 625mg — Expires in 23 days</p>
          <p className="text-xs text-amber-800/70">Stock: 45 units — Value at risk: Rs. 4,050</p>
        </div>
      </div>

      <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-red-600">
          <Info className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Low Stock</span>
        </div>
        <div className="space-y-1">
          <p className="font-bold text-slate-800">ORS Sachet — Only 3 units remaining</p>
          <p className="text-xs text-red-800/70">Reorder level: 20 — Order from supplier</p>
        </div>
      </div>

      <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-sky-600">
          <Bell className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">DRAP Update</span>
        </div>
        <div className="space-y-1">
          <p className="font-bold text-slate-800">12 medicine prices updated by DRAP</p>
          <p className="text-xs text-sky-800/70">Review if price adjustment needed</p>
        </div>
      </div>
    </div>
  )
}

function SettingsMockup() {
  return (
    <div className="p-8 space-y-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Store Name</label>
          <div className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-4 flex items-center text-sm text-primary font-medium">Apollo Pharmacy</div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Receipt Header</label>
          <div className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-4 flex items-center text-sm text-primary font-medium">Apollo Pharmacy — Lahore</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">GST Rate</label>
            <div className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-4 flex items-center text-sm text-primary font-medium">0%</div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Theme</label>
            <div className="w-full h-10 bg-white border border-primary rounded-lg px-4 flex items-center justify-between text-sm text-primary font-medium">
              Light
              <div className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-slate-50 border border-slate-200 rounded-lg px-4 flex items-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">Email Address</div>
          <div className="w-24 h-10 bg-primary rounded-lg flex items-center justify-center text-[10px] text-white font-bold uppercase tracking-widest">Invite</div>
        </div>
      </div>
    </div>
  )
}

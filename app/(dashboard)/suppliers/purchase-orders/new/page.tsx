export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { PurchaseOrderForm } from '@/components/suppliers/purchase-order-form'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewPurchaseOrderPage({
  searchParams,
}: {
  searchParams: { supplier?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tenantId = user?.app_metadata?.tenant_id

  const [suppliers, medicines] = await Promise.all([
    supabase.from('suppliers').select('id, name, city, email').eq('tenant_id', tenantId).eq('is_active', true),
    supabase.from('store_medicines').select('*, medicines(name, category)').eq('tenant_id', tenantId).eq('is_active', true)
  ])

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/suppliers/purchase-orders">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-primary">New Purchase Order</h1>
      </div>

      <PurchaseOrderForm
        suppliers={suppliers.data || []}
        medicines={medicines.data || []}
        initialSupplierId={searchParams.supplier}
      />
    </div>
  )
}

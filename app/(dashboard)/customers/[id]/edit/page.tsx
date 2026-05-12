export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { CustomerForm } from '@/components/customers/customer-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tenantId = user?.app_metadata?.tenant_id

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', params.id)
    .eq('tenant_id', tenantId)
    .single()

  if (!customer) notFound()

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/customers/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-primary">Edit Customer</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Details: {customer.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm customer={customer} />
        </CardContent>
      </Card>
    </div>
  )
}

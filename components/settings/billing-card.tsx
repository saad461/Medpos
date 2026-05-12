import { CreditCard, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface BillingCardProps {
  tenant: any
  subscription: any
}

export function BillingCard({ tenant, subscription }: BillingCardProps) {
  const plan = tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)
  const status = subscription?.status || 'active'
  const expiryDate = subscription?.period_end ? new Date(subscription.period_end) : null

  const statusColors = {
    active: 'bg-success/10 text-success border-success/20',
    trialing: 'bg-accent/10 text-accent border-accent/20',
    past_due: 'bg-destructive/10 text-destructive border-destructive/20',
    cancelled: 'bg-muted text-muted-foreground border-muted-foreground/20',
  }

  const prices = {
    starter: 'Rs. 2,000',
    professional: 'Rs. 5,000',
    business: 'Rs. 10,000',
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Current Plan</CardTitle>
          <Badge variant="outline" className={statusColors[status as keyof typeof statusColors]}>
            {status.toUpperCase()}
          </Badge>
        </div>
        <CardDescription>You are currently on the {plan} plan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{prices[tenant.plan as keyof typeof prices] || 'Rs. 0'}</span>
          <span className="text-muted-foreground text-sm">/month</span>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span>Full POS & Inventory Access</span>
          </div>
          {expiryDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Renews on {format(expiryDate, 'PP')}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 border-t p-4">
        <Button className="w-full" variant="outline">
          Change Plan
        </Button>
      </CardFooter>
    </Card>
  )
}

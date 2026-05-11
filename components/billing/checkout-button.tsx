'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { PlanId } from '@/lib/safepay/plans'

interface CheckoutButtonProps {
  planId: PlanId
  billing: 'monthly' | 'yearly'
  label?: string
  variant?: 'default' | 'outline'
  className?: string
}

export function CheckoutButton({
  planId,
  billing,
  label = "Choose This Plan",
  variant = "default",
  className
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const handleCheckout = async () => {
    if (!user) {
      window.location.href = '/signup'
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billing,
          userId: user.id,
          email: user.email,
          storeName: user.user_metadata?.store_name || 'My Medical Store',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate checkout')
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch (error: any) {
      toast.error(error.message)
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      variant={variant}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting to payment...
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  )
}

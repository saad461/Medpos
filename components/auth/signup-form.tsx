'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RoleBadge } from '@/components/settings/role-badge'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  storeName: z.string().min(2, 'Store name is required').optional(),
})

interface SignupFormProps {
  inviteData?: {
    token: string
    email: string
    name: string
    role: string
    storeName: string
  }
}

export function SignupForm({ inviteData }: SignupFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: inviteData?.name || '',
      email: inviteData?.email || '',
      password: '',
      storeName: inviteData?.storeName || '',
    },
  })

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setIsLoading(true)
    try {
      // 1. Auth Signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            invite_token: inviteData?.token
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Signup failed')

      // 2. Handle Invitation vs New Store logic (Simplified for Step 13 focus)
      // In a full implementation, a Trigger on auth.users handles public.users creation
      // or we call an API route here. Let's assume an API route for invitation handling.

      if (inviteData) {
        const response = await fetch('/api/auth/accept-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: authData.user.id,
            token: inviteData.token,
          }),
        })

        if (!response.ok) throw new Error('Failed to link to store')

        toast.success(`Welcome to ${inviteData.storeName}!`)
        router.push('/dashboard')
      } else {
        // Redirect to onboarding (no email verification check for now)
        router.push('/onboarding')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {inviteData && (
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 mb-6">
            <p className="text-sm font-medium mb-2">Joining store:</p>
            <p className="text-lg font-bold text-primary">{inviteData.storeName}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Your role:</span>
              <RoleBadge role={inviteData.role as any} />
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Ahmed Ali" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="name@example.com"
                  {...field}
                  readOnly={!!inviteData}
                  className={inviteData ? "bg-muted" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!inviteData && (
          <FormField
            control={form.control}
            name="storeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pharmacy Name</FormLabel>
                <FormControl>
                  <Input placeholder="Al-Shifa Medical Store" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {inviteData ? 'Complete Registration' : 'Create Account'}
        </Button>
      </form>
    </Form>
  )
}

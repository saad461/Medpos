'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, Check } from 'lucide-react'
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
  const [isSuccess, setIsSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')
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
    setUserEmail(values.email)
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

      // If session is null, it means email verification is required
      if (!authData.session) {
        setIsSuccess(true)
        return
      }

      // 2. Handle Invitation vs New Store logic
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
        // Redirect to onboarding
        router.push('/onboarding')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Check your email</h2>
          <p className="text-slate-500">
            We've sent a verification link to <span className="font-semibold text-slate-900">{userEmail}</span>.
            Please click the link to confirm your account.
          </p>
        </div>
        <div className="pt-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Return to login</Link>
          </Button>
        </div>
        <p className="text-xs text-slate-400">
          Didn't receive the email? Check your spam folder or contact support.
        </p>
      </div>
    )
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

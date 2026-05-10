'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'
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
import { signInWithEmail } from '@/lib/auth/actions'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { DemoBanner } from './demo-banner'
import { DEMO_CREDENTIALS } from '@/lib/demo-seed'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export function LoginForm({ isDemo = false }: { isDemo?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: isDemo ? DEMO_CREDENTIALS.email : "",
      password: isDemo ? DEMO_CREDENTIALS.password : "",
    },
  })

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'oauth_error') {
      toast.error("Google authentication failed. Please try again.")
    }
    const message = searchParams.get('message')
    if (message === 'verified') {
      toast.success("Email verified! Please log in to continue.")
    }
    if (message === 'reset') {
      toast.success("Password reset! Please log in with your new password.")
    }
  }, [searchParams])

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    const result = await signInWithEmail(values)

    if (result.error) {
      form.setError('root', { message: result.error })
      setIsLoading(false)
    } else if (result.redirectTo) {
      router.push(result.redirectTo)
    }
  }

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {form.formState.errors.root && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 flex items-center gap-3 text-danger text-sm font-medium animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4" />
              {form.formState.errors.root.message}
            </div>
          )}

          {isDemo && (
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-xs font-medium text-primary">
              💡 Demo credentials pre-filled. Click Sign In to explore.
            </div>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="your@email.com"
                    type="email"
                    autoFocus
                    {...field}
                    className={cn(form.formState.errors.email && "border-danger focus-visible:ring-danger")}
                  />
                </FormControl>
                <FormMessage className="text-danger" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      {...field}
                      className={cn(form.formState.errors.password && "border-danger focus-visible:ring-danger")}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FormMessage className="text-danger" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 text-md font-bold shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'
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
import { forgotPassword } from '@/lib/auth/actions'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true)
    setEmail(values.email)
    await forgotPassword(values.email)
    setIsSuccess(true)
    setIsLoading(false)
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
          <Mail className="h-10 w-10 text-accent" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-primary">Reset link sent!</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            If an account exists for <span className="font-bold text-primary">{email}</span>,
            you will receive a password reset link shortly.
          </p>
          <p className="text-xs text-muted-foreground pt-4">
            Check your spam folder if you don't see it within 2 minutes.
          </p>
        </div>
        <Button variant="ghost" asChild className="w-full gap-2">
          <Link href="/login">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                  {...field}
                  className={cn(form.formState.errors.email && "border-danger focus-visible:ring-danger")}
                />
              </FormControl>
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
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>
    </Form>
  )
}

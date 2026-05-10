'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'
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
import { resetPassword } from '@/lib/auth/actions'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Minimum 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export function ResetPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: 'onBlur'
  })

  const { watch } = form
  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  const getPasswordStrength = (pass: string) => {
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[a-z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score
  }

  const strength = getPasswordStrength(password)
  const strengthConfig = [
    { label: "Weak", color: "bg-danger" },
    { label: "Fair", color: "bg-orange-500" },
    { label: "Fair", color: "bg-orange-500" },
    { label: "Good", color: "bg-warning" },
    { label: "Strong", color: "bg-success" },
    { label: "Strong", color: "bg-success" },
  ]

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    setIsLoading(true)
    const result = await resetPassword(values.password)

    if (result.error) {
      form.setError('root', { message: result.error })
      setIsLoading(false)
    } else {
      setIsSuccess(true)
      setIsLoading(false)
      setTimeout(() => {
        router.push('/login?message=reset')
      }, 3000)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-primary">Password reset successfully!</h3>
          <p className="text-muted-foreground leading-relaxed">
            Redirecting you to sign in...
          </p>
        </div>
        <Button variant="ghost" asChild className="w-full">
          <Link href="/login?message=reset">Click here if not redirected automatically</Link>
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    placeholder="Min 8 characters"
                    type={showPassword ? "text" : "password"}
                    {...field}
                    className={cn(form.formState.errors.password && "border-danger focus-visible:ring-danger")}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FormMessage className="text-danger" />
              {password && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1 h-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 rounded-full transition-colors",
                          i < Math.min(strength, 4) ? strengthConfig[strength].color : "bg-slate-100"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    className={cn(form.formState.errors.confirmPassword && "border-danger focus-visible:ring-danger")}
                  />
                </FormControl>
                {password && confirmPassword && (
                  <div className="absolute -right-7 top-1/2 -translate-y-1/2">
                    {password === confirmPassword ? (
                      <CheckCircle2 className="h-5 w-5 text-success animate-in fade-in" />
                    ) : (
                      <XCircle className="h-5 w-5 text-danger animate-in fade-in" />
                    )}
                  </div>
                )}
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
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>
    </Form>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { signUpWithEmail } from '@/lib/auth/actions'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Mail } from 'lucide-react'

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  storeName: z.string().min(2, "Store name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^03[0-9]{2}-?[0-9]{7}$/, "Format: 03XX-XXXXXXX"),
  password: z.string()
    .min(8, "Minimum 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      storeName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
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

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setIsLoading(true)
    const result = await signUpWithEmail(values)

    if (result.error) {
      form.setError('root', { message: result.error })
      setIsLoading(false)
    } else {
      setUserEmail(values.email)
      setIsSuccess(true)
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
          <Mail className="h-10 w-10 text-accent" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-primary">Check your email!</h3>
          <p className="text-muted-foreground leading-relaxed">
            We sent a verification link to <span className="font-bold text-primary">{userEmail}</span>.
            Click the link to verify your account and continue.
          </p>
        </div>
        <div className="pt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn't receive it? Check your spam folder or
          </p>
          <Button variant="outline" className="w-full">Resend verification email</Button>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-sm text-primary font-bold hover:underline block mx-auto"
          >
            Wrong email? Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {form.formState.errors.root && (
          <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 flex items-center gap-3 text-danger text-sm font-medium animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4" />
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Muhammad Ahmed" {...field} className={cn(form.formState.errors.name && "border-danger focus-visible:ring-danger")} />
              </FormControl>
              <FormMessage className="text-danger" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="storeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical Store Name</FormLabel>
              <FormControl>
                <Input placeholder="Al-Shifa Medical Store" {...field} className={cn(form.formState.errors.storeName && "border-danger focus-visible:ring-danger")} />
              </FormControl>
              <FormDescription className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                This will appear on your invoices and receipts
              </FormDescription>
              <FormMessage className="text-danger" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="ahmed@example.com" type="email" {...field} className={cn(form.formState.errors.email && "border-danger focus-visible:ring-danger")} />
                </FormControl>
                <FormMessage className="text-danger" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="0300-1234567" {...field} className={cn(form.formState.errors.phone && "border-danger focus-visible:ring-danger")} />
                </FormControl>
                <FormMessage className="text-danger" />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                </div>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FormMessage className="text-danger" />

                {/* Strength Indicator */}
                {password && (
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-1 h-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 rounded-full transition-colors duration-500",
                            i < Math.min(strength, 4) ? strengthConfig[strength].color : "bg-slate-100"
                          )}
                        />
                      ))}
                    </div>
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider", strengthConfig[strength].color.replace('bg-', 'text-'))}>
                      Strength: {strengthConfig[strength].label}
                    </p>
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
                <FormLabel>Confirm Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                      className={cn(
                        form.formState.errors.confirmPassword && "border-danger focus-visible:ring-danger",
                        password && confirmPassword && password === confirmPassword && "border-success focus-visible:ring-success"
                      )}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {password && confirmPassword && (
                    <div className="absolute -right-7 top-1/2 -translate-y-1/2">
                      {password === confirmPassword ? (
                        <CheckCircle2 className="h-5 w-5 text-success animate-in fade-in zoom-in" />
                      ) : (
                        <XCircle className="h-5 w-5 text-danger animate-in fade-in zoom-in" />
                      )}
                    </div>
                  )}
                </div>
                <FormMessage className="text-danger" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className={cn(form.formState.errors.terms && "border-danger")}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-medium text-slate-600">
                  I agree to the <Link href="#" className="text-primary font-bold hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary font-bold hover:underline">Privacy Policy</Link>
                </FormLabel>
                <FormMessage className="text-danger" />
              </div>
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
              Creating your account...
            </>
          ) : (
            'Create Account & Start Free Trial'
          )}
        </Button>
      </form>
    </Form>
  )
}

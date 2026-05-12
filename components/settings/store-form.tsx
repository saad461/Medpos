'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { AlertTriangle, Loader2, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { PAKISTAN_CITIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { StoreSettings, Tenant } from '@/types'

const storeFormSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters').max(100),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  ntn: z.string().optional(),
  strn: z.string().optional(),
  gst_rate: z.coerce.number().min(0).max(100),
  theme: z.enum(['light', 'dark']),
})

type StoreFormValues = z.infer<typeof storeFormSchema>

interface StoreFormProps {
  settings: StoreSettings
  tenant: Tenant
}

export function StoreForm({ settings, tenant }: StoreFormProps) {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: tenant.name || '',
      city: settings.city || '',
      address: settings.address || '',
      phone: settings.phone || '',
      whatsapp: (settings as any).whatsapp || '',
      email: (settings as any).store_email || '',
      ntn: (settings as any).ntn || '',
      strn: (settings as any).strn || '',
      gst_rate: settings.gst_rate || 0,
      theme: (settings.theme as 'light' | 'dark') || 'light',
    },
  })

  const gstRate = form.watch('gst_rate')
  const gstRateChanged = gstRate !== settings.gst_rate

  async function onSubmit(values: StoreFormValues) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast.success('Store settings saved!')
      router.refresh()
    } catch (_error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Store Details</h4>
            <div className="h-px bg-border mt-2" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Al-Shifa Medical Store" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Store Slug (read-only)</FormLabel>
              <FormControl>
                <Input value={`medpos.pk/store/${tenant.slug}`} readOnly className="bg-muted" />
              </FormControl>
              <FormDescription>
                Your unique store identifier — cannot be changed
              </FormDescription>
            </FormItem>

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAKISTAN_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
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
                    <Input placeholder="0300-1234567" {...field} />
                  </FormControl>
                  <FormDescription>Appears on receipts and invoices</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl>
                    <Input placeholder="0300-1234567" {...field} />
                  </FormControl>
                  <FormDescription>Customers can contact you on WhatsApp</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="store@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Address</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Shop 12, Main Market, Model Town, Lahore"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="ntn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NTN (National Tax Number)</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567-8" {...field} />
                  </FormControl>
                  <FormDescription>Required for GST tax report</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="strn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>STRN (Sales Tax Registration Number)</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890123" {...field} />
                  </FormControl>
                  <FormDescription>Required for FBR GST filing</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section 2: Tax & Currency */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Tax Settings</h4>
            <div className="h-px bg-border mt-2" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="gst_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Applied to all sales. Set to 0 if not GST registered.
                  </FormDescription>
                  {gstRateChanged && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 mt-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                      <p className="text-sm text-warning">
                        Changing GST rate affects all future sales only.
                        Existing sales and reports are not affected.
                      </p>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input value="PKR — Pakistani Rupee" readOnly className="bg-muted" />
              </FormControl>
              <FormDescription>Currency cannot be changed</FormDescription>
            </FormItem>
          </div>
        </div>

        {/* Section 3: Appearance */}
        <div id="appearance" className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Appearance</h4>
            <div className="h-px bg-border mt-2" />
          </div>

          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Theme</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-4">
                    <Card
                      className={cn(
                        "cursor-pointer border-2 hover:border-primary transition-all",
                        field.value === 'light' ? "border-primary" : "border-transparent"
                      )}
                      onClick={() => {
                        field.onChange('light')
                        setTheme('light')
                      }}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                        <Sun className="h-8 w-8" />
                        <span className="font-medium">Light Mode</span>
                      </CardContent>
                    </Card>
                    <Card
                      className={cn(
                        "cursor-pointer border-2 hover:border-primary transition-all",
                        field.value === 'dark' ? "border-primary" : "border-transparent"
                      )}
                      onClick={() => {
                        field.onChange('dark')
                        setTheme('dark')
                      }}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                        <Moon className="h-8 w-8" />
                        <span className="font-medium">Dark Mode</span>
                      </CardContent>
                    </Card>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Store Settings
        </Button>
      </form>
    </Form>
  )
}

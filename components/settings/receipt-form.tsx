'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, Info } from 'lucide-react'

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
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ReceiptPreview } from '@/components/settings/receipt-preview'
import { StoreSettings, Tenant } from '@/types'

const receiptFormSchema = z.object({
  receipt_header: z.string().max(200, 'Header must be less than 200 characters').optional(),
  show_logo_on_receipt: z.boolean(),
  show_address: z.boolean(),
  show_drap_mrp: z.boolean(),
  show_generic_name: z.boolean(),
  show_profit_on_receipt: z.boolean(),
  receipt_footer_msg: z.string().max(100, 'Thank you message must be less than 100 characters').optional(),
  receipt_footer: z.string().max(300, 'Footer must be less than 300 characters').optional(),
  show_powered_by: z.boolean(),
  receipt_width: z.enum(['58mm', '80mm', 'A4']),
  receipt_font_size: z.enum(['small', 'medium', 'large']),
  print_duplicate: z.boolean(),
})

type ReceiptFormValues = z.infer<typeof receiptFormSchema>

interface ReceiptFormProps {
  settings: StoreSettings & { receipt_footer_text?: string }
  tenant: Tenant
}

export function ReceiptForm({ settings, tenant }: ReceiptFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      receipt_header: settings.receipt_header || '',
      show_logo_on_receipt: (settings as any).show_logo_on_receipt ?? true,
      show_address: !!settings.address,
      show_drap_mrp: (settings as any).show_drap_mrp ?? false,
      show_generic_name: (settings as any).show_generic_name ?? true,
      show_profit_on_receipt: (settings as any).show_profit_on_receipt ?? false,
      receipt_footer_msg: settings.receipt_footer || 'Thank you for your business!',
      receipt_footer: settings.receipt_footer_text || '',
      show_powered_by: (settings as any).show_powered_by ?? true,
      receipt_width: (settings as any).receipt_width || '80mm',
      receipt_font_size: (settings as any).receipt_font_size || 'medium',
      print_duplicate: (settings as any).print_duplicate ?? false,
    },
  })

  const watchedValues = form.watch()

  async function onSubmit(values: ReceiptFormValues) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/receipt', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast.success('Receipt settings saved!')
      router.refresh()
    } catch (_error) {
      toast.error('Failed to save receipt settings.')
    } finally {
      setIsLoading(false)
    }
  }

  const isBusinessPlan = tenant.plan === 'business'

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Section 1: Receipt Header */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Receipt Header</h4>
                <div className="h-px bg-border mt-2" />
              </div>

              <FormField
                control={form.control}
                name="receipt_header"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receipt Header Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Apollo Pharmacy\nShop 5, Main Bazaar, Lahore\n0300-1234567`}
                        className="font-mono text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Appears at the top of every receipt</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="show_logo_on_receipt"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Logo on Receipt</FormLabel>
                      <FormDescription>
                        {!settings.logo_url ? "Upload a logo first" : "Displays your store logo at the top"}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!settings.logo_url}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Section 2: Receipt Body */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Receipt Body</h4>
                <div className="h-px bg-border mt-2" />
              </div>

              <FormField
                control={form.control}
                name="show_drap_mrp"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show DRAP MRP</FormLabel>
                      <FormDescription>Shows DRAP reference price next to sale price</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="show_generic_name"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Generic Name</FormLabel>
                      <FormDescription>Shows generic name below medicine name</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="show_profit_on_receipt"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Profit Margin</FormLabel>
                      <FormDescription>Shows profit % on receipt (owner copy only)</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Section 3: Receipt Footer */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Receipt Footer</h4>
                <div className="h-px bg-border mt-2" />
              </div>

              <FormField
                control={form.control}
                name="receipt_footer_msg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thank You Message</FormLabel>
                    <FormControl>
                      <Input placeholder="Thank you for your business!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receipt_footer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Footer Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Returns accepted within 3 days with receipt."
                        className="text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="show_powered_by"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Powered by MedPOS</FormLabel>
                      <FormDescription>
                        {!isBusinessPlan && "Upgrade to Business plan to remove MedPOS branding"}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isBusinessPlan}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Section 4: Format */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Receipt Format</h4>
                <div className="h-px bg-border mt-2" />
              </div>

              <FormField
                control={form.control}
                name="receipt_width"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Receipt Width</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="58mm" />
                          </FormControl>
                          <FormLabel className="font-normal">58mm (Small Thermal)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="80mm" />
                          </FormControl>
                          <FormLabel className="font-normal">80mm (Standard Thermal)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="A4" />
                          </FormControl>
                          <FormLabel className="font-normal">A4 (Laser Printer)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receipt_font_size"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Font Size</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="small" />
                          </FormControl>
                          <FormLabel className="font-normal">Small</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="medium" />
                          </FormControl>
                          <FormLabel className="font-normal">Medium</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="large" />
                          </FormControl>
                          <FormLabel className="font-normal">Large</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="print_duplicate"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Print Duplicate Copy</FormLabel>
                      <FormDescription>Automatically triggers two copies when printing</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Receipt Settings
            </Button>
          </form>
        </Form>
      </div>

      <div className="sticky top-8 self-start">
        <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
          Live Receipt Preview
          <Info className="h-4 w-4 text-muted-foreground" />
        </h4>
        <ReceiptPreview
          values={watchedValues}
          storeName={tenant.name}
          logoUrl={settings.logo_url}
          address={settings.address}
        />
      </div>
    </div>
  )
}

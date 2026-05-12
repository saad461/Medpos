'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createSupplier, updateSupplier } from '@/lib/suppliers/actions'
import { Loader2 } from 'lucide-react'
import { PAKISTAN_CITIES } from '@/lib/constants'

const supplierSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  phone: z.string().regex(/^03[0-9]{2}-?[0-9]{7}$/, 'Please enter a valid Pakistani phone number'),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().optional(),
  address: z.string().optional(),
  ntn: z.string().optional(),
  notes: z.string().optional(),
})

type SupplierFormValues = z.infer<typeof supplierSchema>

interface SupplierFormProps {
  supplier?: any
  onSuccess?: (supplier: any) => void
}

export function SupplierForm({ supplier, onSuccess }: SupplierFormProps) {
  const [loading, setLoading] = React.useState(false)
  const isEdit = !!supplier

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name || '',
      phone: supplier?.phone || '',
      email: supplier?.email || '',
      city: supplier?.city || '',
      address: supplier?.address || '',
      ntn: supplier?.ntn || '',
      notes: supplier?.notes || '',
    },
  })

  async function onSubmit(values: SupplierFormValues) {
    try {
      setLoading(true)
      let result
      if (isEdit) {
        result = await updateSupplier(supplier.id, values)
        toast.success('Supplier updated successfully')
      } else {
        result = await createSupplier(values)
        toast.success('Supplier created successfully')
      }
      if (onSuccess) onSuccess(result)
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company / Supplier Name</FormLabel>
              <FormControl>
                <Input placeholder="Fazal Din & Sons Pharma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="0300-1234567" {...field} />
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
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="supplier@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ntn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NTN (National Tax Number)</FormLabel>
                <FormControl>
                  <Input placeholder="1234567-1" {...field} />
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
                <Textarea placeholder="Address details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Payment terms, sales rep info etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Supplier' : 'Save Supplier'}
        </Button>
      </form>
    </Form>
  )
}

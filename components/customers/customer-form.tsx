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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createCustomer, updateCustomer } from '@/lib/customers/actions'
import { Loader2 } from 'lucide-react'

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^03[0-9]{2}-?[0-9]{7}$/, 'Please enter a valid Pakistani phone number (e.g., 0300-1234567)').optional().or(z.literal('')),
  cnic: z.string().regex(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, 'Please enter a valid CNIC (XXXXX-XXXXXXX-X)').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
  credit_limit: z.coerce.number().optional().nullable(),
  initial_credit_balance: z.coerce.number().default(0),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface CustomerFormProps {
  customer?: any
  onSuccess?: (customer: any) => void
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const [loading, setLoading] = React.useState(false)
  const isEdit = !!customer

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || '',
      phone: customer?.phone || '',
      cnic: customer?.cnic || '',
      address: customer?.address || '',
      notes: customer?.notes || '',
      credit_limit: customer?.credit_limit || null,
      initial_credit_balance: customer?.credit_balance || 0,
    },
  })

  async function onSubmit(values: CustomerFormValues) {
    try {
      setLoading(true)
      let result
      if (isEdit) {
        result = await updateCustomer(customer.id, values)
        toast.success('Customer updated successfully')
      } else {
        result = await createCustomer(values)
        toast.success('Customer created successfully')
      }
      if (onSuccess) onSuccess(result)
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // CNIC Auto-formatter
  const handleCNICChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 13) val = val.substring(0, 13)

    let formatted = val
    if (val.length > 5 && val.length <= 12) {
      formatted = val.replace(/(\d{5})(\d+)/, '$1-$2')
    } else if (val.length > 12) {
      formatted = val.replace(/(\d{5})(\d{7})(\d+)/, '$1-$2-$3')
    }
    onChange(formatted)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Muhammad Ahmed" {...field} />
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
                <FormDescription>Used for WhatsApp and SMS</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cnic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNIC (National ID)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="35201-1234567-1"
                    {...field}
                    onChange={(e) => handleCNICChange(e, field.onChange)}
                  />
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
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="House 12, Street 5, Model Town, Lahore" {...field} />
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
                <Textarea placeholder="Regular customer — takes medicines for diabetes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="credit_limit"
            render={({ field: { value, ...field } }) => (
              <FormItem>
                <FormLabel>Credit Limit (PKR)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5000" value={value || ''} {...field} />
                </FormControl>
                <FormDescription>Max credit allowed (warning threshold)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isEdit && (
            <FormField
              control={form.control}
              name="initial_credit_balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Credit Balance (PKR)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>Existing outstanding balance</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Customer' : 'Save Customer'}
        </Button>
      </form>
    </Form>
  )
}

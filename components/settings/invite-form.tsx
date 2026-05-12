'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, Check, X } from 'lucide-react'

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const inviteFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'pharmacist', 'cashier']),
  message: z.string().max(200).optional(),
})

type InviteFormValues = z.infer<typeof inviteFormSchema>

export function InviteForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'cashier',
      message: '',
    },
  })

  async function onSubmit(values: InviteFormValues) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send invitation')
      }

      toast.success(`Invitation sent to ${values.email}!`)
      router.push('/settings/users')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <div className="grid gap-4 md:grid-cols-2">
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
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="ahmed@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Select Role</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid gap-4"
                >
                  <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-accent/5 transition-colors">
                    <RadioGroupItem value="admin" id="invite-admin" className="mt-1" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="invite-admin" className="font-bold">Admin</Label>
                      <p className="text-xs text-muted-foreground">
                        Full access except billing. Can manage all medicines, sales, customers, and team members.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-accent/5 transition-colors">
                    <RadioGroupItem value="pharmacist" id="invite-pharmacist" className="mt-1" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="invite-pharmacist" className="font-bold">Pharmacist</Label>
                      <p className="text-xs text-muted-foreground">
                        Can view inventory and customers. Cannot make sales or change prices. Good for dispensing staff.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-accent/5 transition-colors">
                    <RadioGroupItem value="cashier" id="invite-cashier" className="mt-1" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="invite-cashier" className="font-bold">Cashier</Label>
                      <p className="text-xs text-muted-foreground">
                        Can make sales at POS. Limited discount privileges. Cannot view reports or manage inventory.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Role Comparison</h4>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[150px]">Feature</TableHead>
                  <TableHead className="text-center">Admin</TableHead>
                  <TableHead className="text-center">Pharmacist</TableHead>
                  <TableHead className="text-center">Cashier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: 'POS Billing', admin: true, pharmacist: false, cashier: true },
                  { name: 'Inventory', admin: true, pharmacist: 'View', cashier: 'View' },
                  { name: 'Reports', admin: true, pharmacist: 'View', cashier: false },
                  { name: 'Customers', admin: true, pharmacist: 'View', cashier: 'Limited' },
                  { name: 'Suppliers', admin: true, pharmacist: 'View', cashier: false },
                  { name: 'Settings', admin: true, pharmacist: false, cashier: false },
                ].map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium text-xs">{row.name}</TableCell>
                    <TableCell className="text-center">
                      {row.admin === true ? <Check className="h-4 w-4 mx-auto text-success" /> : <span className="text-xs">{row.admin}</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.pharmacist === true ? <Check className="h-4 w-4 mx-auto text-success" /> : row.pharmacist === false ? <X className="h-4 w-4 mx-auto text-muted-foreground opacity-30" /> : <span className="text-xs">{row.pharmacist}</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.cashier === true ? <Check className="h-4 w-4 mx-auto text-success" /> : row.cashier === false ? <X className="h-4 w-4 mx-auto text-muted-foreground opacity-30" /> : <span className="text-xs">{row.cashier}</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personal Message (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Welcome to our pharmacy team!"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Add a note to the invitation email</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Invitation
        </Button>
      </form>
    </Form>
  )
}

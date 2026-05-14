'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/cron/helpers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(2).max(50),
  storeName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
  phone: z.string().regex(/^03[0-9]{2}-?[0-9]{7}$/, "Invalid Pakistani phone format (03XX-XXXXXXX)")
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export async function signUpWithEmail(formData: z.infer<typeof signupSchema>) {
  const supabase = await createClient()

  const validated = signupSchema.safeParse(formData)
  if (!validated.success) {
    return { error: 'Invalid input data' }
  }

  const { name, storeName, email, password, phone } = validated.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        store_name: storeName,
        phone
      },
      emailRedirectTo: undefined
    }
  })

  if (error) return { error: error.message }
  return { success: true, redirectTo: '/onboarding' }
}

export async function signInWithEmail(formData: z.infer<typeof loginSchema>) {
  const supabase = await createClient()

  const validated = loginSchema.safeParse(formData)
  if (!validated.success) {
    return { error: 'Invalid email or password' }
  }

  const { email, password } = validated.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) return { error: 'Invalid email or password' }

  // Check profile and tenant status (using service role to bypass RLS for this check)
  const adminSupabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Authentication failed' }

  const { data: profile } = await adminSupabase
    .from('users')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { success: true, redirectTo: '/onboarding' }
  }

  const { data: tenant } = await adminSupabase
    .from('tenants')
    .select('status')
    .eq('id', profile.tenant_id)
    .single()

  if (!tenant) return { success: true, redirectTo: '/onboarding' }

  if (tenant.status === 'pending_admin_approval') return { success: true, redirectTo: '/pending-approval' }
  if (tenant.status === 'suspended') return { success: true, redirectTo: '/suspended' }
  if (tenant.status === 'cancelled') return { success: true, redirectTo: '/onboarding' }

  return { success: true, redirectTo: '/dashboard' }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  })

  if (error) return { error: error.message }
  return { url: data.url }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function forgotPassword(email: string) {
  const supabase = await createClient()

  const validated = z.string().email().safeParse(email)
  if (!validated.success) return { success: true } // Don't reveal existence

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
  })

  return { success: true }
}

export async function resetPassword(password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }
  return { success: true }
}

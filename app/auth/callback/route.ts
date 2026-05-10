import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user already has a tenant (returning user)
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Use service role to check profiles (user might not have tenant_id in metadata yet)
        const adminSupabase = await createClient(true)
        const { data: existingUser } = await adminSupabase
          .from('users')
          .select('tenant_id')
          .eq('id', user.id)
          .single()

        if (existingUser?.tenant_id) {
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      }
      return NextResponse.redirect(`${origin}/onboarding`)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/login?error=oauth_error`)
}

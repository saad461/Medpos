export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Smartphone, Monitor, Lock } from 'lucide-react'

export default async function SecurityPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SettingsLayout>
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium">Security</h3>
          <p className="text-sm text-muted-foreground">
            Manage your password and security settings.
          </p>
        </div>

        {/* Section 1: Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change Password</CardTitle>
            <CardDescription>
              Ensure your account is using a long, random password to stay secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button>Update Password</Button>
          </CardContent>
        </Card>

        {/* Section 2: Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Sessions</CardTitle>
            <CardDescription>
              This is a list of devices that have recently logged into your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-4">
                <Monitor className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-xs text-muted-foreground">
                    Pakistan • Chrome on Windows
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Active Now
              </Badge>
            </div>

            <Button variant="outline" size="sm" disabled className="w-full">
              Sign out of all other sessions
            </Button>
          </CardContent>
        </Card>

        {/* Section 3: Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
            </div>
            <CardDescription>
              Add an extra layer of security to your account using TOTP or SMS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 rounded-lg border border-dashed bg-muted/10">
              <Lock className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Secure your account</p>
                <p className="text-xs text-muted-foreground">
                  Multi-factor authentication is currently being rolled out to all MedPOS users.
                </p>
              </div>
              <Button size="sm" variant="outline" disabled className="ml-auto">
                Enable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  )
}

function Badge({ children, variant, className }: any) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors border",
      variant === 'outline' ? 'border-border' : 'bg-secondary text-secondary-foreground border-transparent',
      className
    )}>
      {children}
    </span>
  )
}

import { cn } from '@/lib/utils'

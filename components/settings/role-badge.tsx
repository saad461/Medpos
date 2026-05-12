import { cn } from '@/lib/utils'

type UserRole = 'super_admin' | 'owner' | 'admin' | 'pharmacist' | 'cashier'

interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const variants = {
    owner: 'bg-primary text-white',
    admin: 'bg-accent/10 text-accent border border-accent/20',
    pharmacist: 'bg-success/10 text-success border border-success/20',
    cashier: 'bg-warning/10 text-warning border border-warning/20',
    super_admin: 'bg-destructive text-destructive-foreground',
  }

  const labels = {
    owner: 'Owner',
    admin: 'Admin',
    pharmacist: 'Pharmacist',
    cashier: 'Cashier',
    super_admin: 'Super Admin',
  }

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
      variants[role] || 'bg-secondary text-secondary-foreground'
    )}>
      {labels[role] || role}
    </span>
  )
}

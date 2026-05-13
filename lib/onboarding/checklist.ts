export interface ChecklistItem {
  id: string
  title: string
  description: string
  action: string
  actionUrl: string
  icon: string
  completedWhen: string
  isCompleted: boolean
  isRequired: boolean
  order: number
}

export const CHECKLIST_ITEMS: Omit<ChecklistItem, 'isCompleted'>[] = [
  {
    id: 'complete_store_info',
    title: 'Complete Store Information',
    description: 'Add your store name, address, phone and logo',
    action: 'Go to Settings',
    actionUrl: '/dashboard/settings/store',
    icon: 'Store',
    completedWhen: 'Store address and phone are saved',
    isRequired: true,
    order: 1,
  },
  {
    id: 'add_first_medicine',
    title: 'Add Your First Medicine',
    description: 'Search from 25,000+ Pakistan medicines and add to inventory',
    action: 'Add Medicine',
    actionUrl: '/dashboard/inventory/add',
    icon: 'Pill',
    completedWhen: 'At least 1 medicine in inventory',
    isRequired: true,
    order: 2,
  },
  {
    id: 'make_first_sale',
    title: 'Make Your First Sale',
    description: 'Open POS billing and complete a test sale',
    action: 'Open POS',
    actionUrl: '/dashboard/pos',
    icon: 'ShoppingCart',
    completedWhen: 'At least 1 sale completed',
    isRequired: true,
    order: 3,
  },
  {
    id: 'add_supplier',
    title: 'Add a Supplier',
    description: 'Add your medicine supplier for purchase order management',
    action: 'Add Supplier',
    actionUrl: '/dashboard/suppliers/add',
    icon: 'Truck',
    completedWhen: 'At least 1 supplier added',
    isRequired: false,
    order: 4,
  },
  {
    id: 'invite_team',
    title: 'Invite a Team Member',
    description: 'Add a cashier or pharmacist to your store',
    action: 'Invite Member',
    actionUrl: '/dashboard/settings/users/invite',
    icon: 'UserPlus',
    completedWhen: 'At least 2 users in store',
    isRequired: false,
    order: 5,
  },
  {
    id: 'customize_receipt',
    title: 'Customize Your Receipt',
    description: 'Add your store details to invoices and receipts',
    action: 'Customize Receipt',
    actionUrl: '/dashboard/settings/receipt',
    icon: 'Receipt',
    completedWhen: 'Receipt header text is saved',
    isRequired: false,
    order: 6,
  },
  {
    id: 'view_reports',
    title: 'Explore Reports',
    description: 'See your sales data, profit, and inventory reports',
    action: 'View Reports',
    actionUrl: '/dashboard/reports',
    icon: 'BarChart3',
    completedWhen: 'Reports page visited at least once',
    isRequired: false,
    order: 7,
  },
]

export function calculateProgress(items: ChecklistItem[]): {
  completed: number
  total: number
  percentage: number
  requiredComplete: boolean
} {
  const completed = items.filter(i => i.isCompleted).length
  const total = items.length
  const requiredItems = items.filter(i => i.isRequired)
  const requiredComplete = requiredItems.every(i => i.isCompleted)
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    requiredComplete,
  }
}

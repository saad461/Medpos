import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: string
  trendUp?: boolean
  highlight?: boolean
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-accent',
  trend,
  trendUp = true,
  highlight = false
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-[#1E293B] rounded-2xl p-6 border transition-all duration-300",
      highlight ? "border-warning/50 shadow-lg shadow-warning/5" : "border-white/5"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-xl bg-white/5", iconColor.replace('text-', 'bg-').replace('text', 'bg').concat('/10'))}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        {trend && (
          <div className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
            trendUp ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          )}>
            {trend}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em]">{title}</h3>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        {subtitle && (
          <p className="text-xs text-white/30 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

import * as React from 'react'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatPKR } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface ReportCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  loading?: boolean
  format?: 'currency' | 'number' | 'percent' | 'text'
}

export function ReportCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  trend,
  loading = false,
  format: formatType = 'text',
}: ReportCardProps) {
  const formattedValue = React.useMemo(() => {
    if (loading) return ''
    if (typeof value === 'string' && formatType !== 'text') {
      const num = parseFloat(value.replace(/[^0-9.-]+/g, ''))
      if (isNaN(num)) return value
      if (formatType === 'currency') return formatPKR(num)
      if (formatType === 'percent') return `${num.toFixed(1)}%`
      if (formatType === 'number') return num.toLocaleString()
    }
    if (typeof value === 'number') {
      if (formatType === 'currency') return formatPKR(value)
      if (formatType === 'percent') return `${value.toFixed(1)}%`
      if (formatType === 'number') return value.toLocaleString()
    }
    return value
  }, [value, formatType, loading])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-8 w-[120px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <h3 className="text-2xl font-bold mt-1 text-primary">
              {formattedValue}
            </h3>
          </div>
          <div className={cn('p-3 rounded-xl bg-opacity-10', iconColor.replace('text-', 'bg-'))}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>

        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium',
                trend.direction === 'up'
                  ? 'bg-emerald-50 text-emerald-700'
                  : trend.direction === 'down'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-gray-50 text-gray-700'
              )}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : trend.direction === 'down' ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {Math.abs(trend.value).toFixed(1)}%
            </div>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}

        {subtitle && !trend && (
          <p className="mt-4 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

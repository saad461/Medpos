'use client'

import * as React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface HourlyHeatmapProps {
  data: { day_of_week: number; hour_of_day: number; count: number }[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8) // 8 AM to 10 PM

export function HourlyHeatmap({ data }: HourlyHeatmapProps) {
  const maxCount = Math.max(...data.map((d) => Number(d.count)), 1)

  const getIntensity = (day: number, hour: number) => {
    const cell = data.find((d) => d.day_of_week === day && d.hour_of_day === hour)
    if (!cell || cell.count === 0) return null
    return Number(cell.count) / maxCount
  }

  const getOpacityClass = (intensity: number | null) => {
    if (intensity === null) return 'bg-slate-50'
    if (intensity <= 0.2) return 'bg-primary/20'
    if (intensity <= 0.4) return 'bg-primary/40'
    if (intensity <= 0.6) return 'bg-primary/60'
    if (intensity <= 0.8) return 'bg-primary/80'
    return 'bg-primary/95'
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px] p-4">
        <div className="flex mb-2">
          <div className="w-12" />
          {HOURS.map((hour) => (
            <div key={hour} className="flex-1 text-center text-xs font-medium text-muted-foreground">
              {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
            </div>
          ))}
        </div>

        {DAYS.map((dayName, dayIndex) => (
          <div key={dayName} className="flex items-center mb-1">
            <div className="w-12 text-xs font-medium text-muted-foreground">{dayName}</div>
            <div className="flex-1 flex gap-1">
              {HOURS.map((hour) => {
                const intensity = getIntensity(dayIndex, hour)
                const count = data.find((d) => d.day_of_week === dayIndex && d.hour_of_day === hour)?.count || 0

                return (
                  <TooltipProvider key={hour}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'flex-1 h-10 rounded-sm transition-colors cursor-help',
                            getOpacityClass(intensity)
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {dayName}, {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                        </p>
                        <p className="font-bold">{count} sales</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>
          </div>
        ))}

        <div className="mt-6 flex items-center justify-end gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
          <span>Low</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded-sm bg-slate-50 border" />
            <div className="w-4 h-4 rounded-sm bg-primary/20" />
            <div className="w-4 h-4 rounded-sm bg-primary/40" />
            <div className="w-4 h-4 rounded-sm bg-primary/60" />
            <div className="w-4 h-4 rounded-sm bg-primary/80" />
            <div className="w-4 h-4 rounded-sm bg-primary/95" />
          </div>
          <span>High</span>
        </div>
      </div>
    </div>
  )
}

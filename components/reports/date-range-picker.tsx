'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { CalendarIcon, Check } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DATE_PRESETS, DateRange } from '@/lib/reports/date-utils'

interface DateRangePickerProps {
  value: DateRange
  onChange?: (range: DateRange) => void
  maxRange?: number
}

export function DateRangePicker({ value, onChange, maxRange }: DateRangePickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateQueryParams = (range: DateRange) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('from', range.from.toISOString())
    params.set('to', range.to.toISOString())
    router.push(`${pathname}?${params.toString()}`)
    if (onChange) onChange(range)
  }

  const isPresetActive = (preset: { from: Date; to: Date }) => {
    return (
      value.from.toDateString() === preset.from.toDateString() &&
      value.to.toDateString() === preset.to.toDateString()
    )
  }

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:items-center md:justify-between p-4 bg-white rounded-xl shadow-sm border mb-6">
      <div className="flex flex-wrap gap-2">
        {Object.entries(DATE_PRESETS).map(([key, preset]) => (
          <Button
            key={key}
            variant={isPresetActive(preset) ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateQueryParams(preset)}
            className="rounded-full h-8"
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'w-[240px] justify-start text-left font-normal',
                !value && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value?.from ? (
                value.to ? (
                  <>
                    {format(value.from, 'LLL dd, y')} - {format(value.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(value.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={{
                from: value?.from,
                to: value?.to,
              }}
              onSelect={(range: any) => {
                if (range?.from && range?.to) {
                  updateQueryParams(range)
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

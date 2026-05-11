import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  isSameDay,
  differenceInDays,
} from 'date-fns'
import { toZonedTime, format as formatTZ } from 'date-fns-tz'

export const PK_TIMEZONE = 'Asia/Karachi'

export type DateRange = {
  from: Date
  to: Date
  label?: string
}

export const DATE_PRESETS = {
  today: {
    label: 'Today',
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  },
  yesterday: {
    label: 'Yesterday',
    from: startOfDay(subDays(new Date(), 1)),
    to: endOfDay(subDays(new Date(), 1)),
  },
  last7days: {
    label: 'Last 7 Days',
    from: startOfDay(subDays(new Date(), 6)),
    to: endOfDay(new Date()),
  },
  last30days: {
    label: 'Last 30 Days',
    from: startOfDay(subDays(new Date(), 29)),
    to: endOfDay(new Date()),
  },
  thisMonth: {
    label: 'This Month',
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  },
  lastMonth: {
    label: 'Last Month',
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(subMonths(new Date(), 1)),
  },
  last3months: {
    label: 'Last 3 Months',
    from: startOfMonth(subMonths(new Date(), 2)),
    to: endOfMonth(new Date()),
  },
  thisYear: {
    label: 'This Year',
    from: startOfYear(new Date()),
    to: endOfYear(new Date()),
  },
} as const

export function formatPKDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatTZ(toZonedTime(d, PK_TIMEZONE), 'dd MMM yyyy', { timeZone: PK_TIMEZONE })
}

export function formatPKDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatTZ(toZonedTime(d, PK_TIMEZONE), 'dd MMM yyyy, h:mm b', { timeZone: PK_TIMEZONE })
}

export function toPKTimezone(utcDate: Date | string): Date {
  const d = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  return toZonedTime(d, PK_TIMEZONE)
}

export function getPreviousPeriod(range: DateRange): DateRange {
  const days = differenceInDays(range.to, range.from) + 1

  // If it's exactly a month (e.g. This Month vs Last Month)
  if (isSameDay(range.from, startOfMonth(range.from)) && isSameDay(range.to, endOfMonth(range.from))) {
    const prevMonth = subMonths(range.from, 1)
    return {
      from: startOfMonth(prevMonth),
      to: endOfMonth(prevMonth),
      label: 'Previous Month'
    }
  }

  return {
    from: startOfDay(subDays(range.from, days)),
    to: endOfDay(subDays(range.from, 1)),
    label: 'Previous Period'
  }
}

export function getDateRangeFromParams(from?: string, to?: string): DateRange {
  if (from && to) {
    return {
      from: startOfDay(new Date(from)),
      to: endOfDay(new Date(to))
    }
  }
  return DATE_PRESETS.thisMonth
}

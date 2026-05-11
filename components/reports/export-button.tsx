'use client'

import * as React from 'react'
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DateRange } from '@/lib/reports/date-utils'
import { toast } from 'sonner'

interface ExportButtonProps {
  reportType: string
  dateRange: DateRange
  format?: 'pdf' | 'csv' | 'both'
  data?: any[]
  apiEndpoint?: string
}

export function ExportButton({
  reportType,
  dateRange,
  format = 'both',
  data,
  apiEndpoint,
}: ExportButtonProps) {
  const [loading, setLoading] = React.useState<string | null>(null)

  const handleExport = async (exportFormat: 'pdf' | 'csv') => {
    try {
      setLoading(exportFormat)

      const params = new URLSearchParams({
        type: reportType,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
        format: exportFormat,
      })

      const response = await fetch(`/api/reports/export?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to generate export')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`${exportFormat.toUpperCase()} export downloaded successfully`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error(`Failed to generate ${exportFormat.toUpperCase()} export`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={!!loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {loading ? 'Generating...' : 'Export Report'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(format === 'both' || format === 'pdf') && (
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="mr-2 h-4 w-4 text-red-500" />
            Export PDF
          </DropdownMenuItem>
        )}
        {(format === 'both' || format === 'csv') && (
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" />
            Export CSV
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

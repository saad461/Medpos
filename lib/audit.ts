import { createClient } from '@/lib/supabase/server'

interface AuditLogEntry {
  tenant_id: string
  user_id: string
  action: string
  table_name: string
  record_id?: string
  old_value?: any
  new_value?: any
  ip_address?: string
}

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from('audit_logs').insert(entry)
  } catch (error) {
    // Never throw from audit log — it must not break the main operation
    console.error('Audit log failed:', error)
  }
}

export async function createAuditLogs(entries: AuditLogEntry[]): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from('audit_logs').insert(entries)
  } catch (error) {
    console.error('Bulk audit log failed:', error)
  }
}

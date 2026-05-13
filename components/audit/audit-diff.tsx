// components/audit/audit-diff.tsx

'use client'

export function AuditDiff({ oldValue, newValue }: { oldValue?: any, newValue?: any }) {
  if (!oldValue && !newValue) return null

  // Handle strings (if they are JSON strings)
  let oldObj = oldValue
  let newObj = newValue

  if (typeof oldValue === 'string') {
    try { oldObj = JSON.parse(oldValue) } catch (e) { oldObj = { value: oldValue } }
  }
  if (typeof newValue === 'string') {
    try { newObj = JSON.parse(newValue) } catch (e) { newObj = { value: newValue } }
  }

  const allKeys = Array.from(new Set([
    ...Object.keys(oldObj || {}),
    ...Object.keys(newObj || {}),
  ]))

  const changedKeys = allKeys.filter(key => {
      const oldVal = oldObj?.[key]
      const newVal = newObj?.[key]
      return JSON.stringify(oldVal) !== JSON.stringify(newVal)
  })

  if (changedKeys.length === 0) return <span className="text-[10px] text-muted-foreground italic">No changes detected</span>

  return (
    <div className="text-[10px] font-mono mt-2 space-y-1 bg-slate-50 p-2 rounded border">
      {changedKeys.map(key => {
        const old = oldObj?.[key]
        const next = newObj?.[key]

        return (
          <div key={key} className="grid grid-cols-3 gap-2 border-b border-slate-200 last:border-0 pb-1 last:pb-0">
            <span className="text-slate-500 font-bold truncate">{key}:</span>
            <span className="text-red-600 bg-red-50 px-1 rounded line-through truncate">
              {old !== undefined ? String(old) : 'null'}
            </span>
            <span className="text-emerald-600 bg-emerald-50 px-1 rounded truncate">
              {next !== undefined ? String(next) : 'null'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

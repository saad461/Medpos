import { cn } from "@/lib/utils"

export function Logo({
  variant = 'default',
  className
}: {
  variant?: 'default' | 'white',
  className?: string
}) {
  const color = variant === 'white' ? '#FFFFFF' : '#1E3A5F'
  const mutedColor = variant === 'white' ? 'text-white/60' : 'text-muted-foreground'

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#1E3A5F"/>
        <path d="M16 8v16M8 16h16" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      <div className="flex flex-col leading-none">
        <span style={{ color }} className="font-bold text-lg tracking-tight leading-tight">MedPOS</span>
        <span className={cn("text-[10px] uppercase tracking-wider", mutedColor)}>
          Medical Store Management
        </span>
      </div>
    </div>
  )
}

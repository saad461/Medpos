import { Badge } from "@/components/ui/badge"
import { Lock, Clock, Globe, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubmissionStatusBadgeProps {
  scope: string
  className?: string
}

export function SubmissionStatusBadge({ scope, className }: SubmissionStatusBadgeProps) {
  switch (scope) {
    case 'private':
      return (
        <Badge variant="outline" className={cn("bg-surface text-muted-foreground gap-1", className)}>
          <Lock className="h-3 w-3" />
          Private
        </Badge>
      )
    case 'pending_review':
      return (
        <Badge variant="outline" className={cn("bg-accent/10 border-accent/30 text-accent gap-1", className)}>
          <Clock className="h-3 w-3 animate-pulse" />
          Under Review
        </Badge>
      )
    case 'global':
      return (
        <Badge variant="outline" className={cn("bg-success/10 border-success/30 text-success gap-1", className)}>
          <Globe className="h-3 w-3" />
          Global
        </Badge>
      )
    case 'rejected':
      return (
        <Badge variant="outline" className={cn("bg-danger/10 border-danger/30 text-danger gap-1", className)}>
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      )
    default:
      return null
  }
}

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface AuthCardProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className
}: AuthCardProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <Card className="border-none shadow-xl rounded-2xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold text-primary">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">{subtitle}</CardDescription>
        </CardHeader>
        <Separator className="opacity-50" />
        <CardContent className="pt-6">
          {children}
        </CardContent>
      </Card>
      {footer && (
        <div className="text-center px-4">
          {footer}
        </div>
      )}
    </div>
  )
}

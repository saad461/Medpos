// components/shared/error-boundary.tsx

'use client'

import React, { ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-warning/5 border border-warning/20 rounded-xl">
          <div className="bg-warning/10 p-4 rounded-full mb-4">
            <AlertTriangle className="h-10 w-10 text-warning" />
          </div>
          <h2 className="text-xl font-bold text-primary mb-2">Something went wrong</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            An unexpected error occurred in this section. We've been notified and are working on it.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Refresh Page
            </Button>
          </div>

          <details className="mt-8 w-full max-w-md">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:underline text-center">
              View error details
            </summary>
            <pre className="mt-2 p-4 bg-slate-950 text-slate-50 text-[10px] overflow-auto rounded-lg max-h-[200px]">
              {this.state.error?.toString()}
              {"\n"}
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

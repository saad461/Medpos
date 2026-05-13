'use client'

import { useState } from 'react'
import { Rocket, ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ChecklistItem } from "@/lib/onboarding/checklist"

interface OnboardingChecklistProps {
  progress: {
    setup_complete: boolean
  }
  checklist: ChecklistItem[]
  summary: {
    completed: number
    total: number
    percentage: number
    requiredComplete: boolean
  }
}

export function OnboardingChecklist({ progress, checklist, summary }: OnboardingChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isDismissing, setIsDismissing] = useState(false)

  if (progress.setup_complete) return null

  const handleDismiss = async () => {
    setIsDismissing(true)
    try {
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        body: JSON.stringify({ action: 'complete_setup' }),
      })
      window.location.reload()
    } catch (error) {
      console.error('Failed to complete setup', error)
      setIsDismissing(false)
    }
  }

  const sortedChecklist = [...checklist].sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return 1
    if (!a.isCompleted && b.isCompleted) return -1
    if (a.isRequired && !b.isRequired) return -1
    if (!a.isRequired && b.isRequired) return 1
    return a.order - b.order
  })

  const isAllComplete = summary.completed === summary.total

  if (isAllComplete) {
    return (
      <div className="bg-success/10 border border-success/20 rounded-2xl p-8 text-center animate-in zoom-in-95 duration-500 mb-8">
        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Rocket className="h-8 w-8 text-success animate-bounce" />
        </div>
        <h3 className="text-2xl font-bold text-primary mb-2">🎉 Setup Complete!</h3>
        <p className="text-muted-foreground mb-6">Your store is fully configured and ready for business.</p>
        <Button onClick={handleDismiss} disabled={isDismissing}>
          {isDismissing ? 'Processing...' : 'Dismiss Checklist'}
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm mb-8 transition-all duration-300">
      <div className="p-6 flex items-center justify-between bg-slate-50 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-primary">Getting Started</h3>
            <p className="text-xs text-muted-foreground">{summary.completed} of {summary.total} complete</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-slate-200"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 20}
                strokeDashoffset={2 * Math.PI * 20 * (1 - summary.percentage / 100)}
                className="text-accent transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-[10px] font-bold">{summary.percentage}%</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-full"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {summary.requiredComplete && !isAllComplete && (
        <div className="bg-success/10 px-6 py-2 border-b flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span className="text-xs font-medium text-success-foreground">
            ✓ Store is ready for business! Complete optional items to get the most out of MedPOS
          </span>
        </div>
      )}

      {isExpanded && (
        <div className="divide-y">
          {sortedChecklist.map((item) => (
            <div
              key={item.id}
              className={cn(
                "p-4 flex items-start gap-4 transition-colors",
                item.isCompleted ? "bg-slate-50/50" : "hover:bg-slate-50"
              )}
            >
              <div className="mt-1">
                {item.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={cn(
                    "font-medium text-sm",
                    item.isCompleted && "text-muted-foreground line-through"
                  )}>
                    {item.title}
                  </h4>
                  {item.isRequired && !item.isCompleted && (
                    <span className="text-[10px] bg-warning/10 text-warning-foreground px-1.5 py-0.5 rounded uppercase font-bold">Required</span>
                  )}
                </div>
                {!item.isCompleted && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                )}
                {item.isCompleted && (
                  <p className="text-[10px] text-success font-medium mt-0.5">✓ Done</p>
                )}
              </div>

              {!item.isCompleted && (
                <Button size="sm" variant="outline" asChild className="h-8 text-xs shrink-0">
                  <Link href={item.actionUrl}>{item.action}</Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="h-1 bg-slate-100 w-full overflow-hidden">
         <div
           className={cn(
             "h-full transition-all duration-1000",
             isAllComplete ? "bg-success" : "bg-accent"
           )}
           style={{ width: `${summary.percentage}%` }}
         />
      </div>
    </div>
  )
}

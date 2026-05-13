import { Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContributorBadgeProps {
  contributorCount: number
  isContributor: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ContributorBadge({ contributorCount, isContributor, size = 'md' }: ContributorBadgeProps) {
  if (!isContributor) return null

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-50 border border-yellow-300 text-yellow-700 text-xs font-medium">
        <Trophy className="h-3 w-3" />
        Contributor
      </div>
    )
  }

  if (size === 'md') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
        <div className="p-2 rounded-full bg-yellow-100">
          <Trophy className="h-5 w-5 text-yellow-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-yellow-900">MedPOS Contributor</p>
          <p className="text-xs text-yellow-700">{contributorCount} medicines contributed to global database</p>
        </div>
      </div>
    )
  }

  if (size === 'lg') {
    return (
      <div className="w-full p-6 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 flex flex-col md:flex-row items-center gap-6">
        <div className="p-4 rounded-full bg-white shadow-sm border border-yellow-100">
          <Trophy className="h-10 w-10 text-yellow-500" />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold text-yellow-900">MedPOS Contributor</h2>
          <p className="text-yellow-800 mt-1 max-w-2xl">
            You have helped Pakistan pharmacies by contributing {contributorCount} medicines to our global database. Thank you for your dedication to the community!
          </p>
        </div>
      </div>
    )
  }

  return null
}

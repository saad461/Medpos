'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'
import { useState } from 'react'

export function RefreshButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRefresh = () => {
    setLoading(true)
    router.refresh()
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      className="bg-white"
      disabled={loading}
    >
      <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  )
}

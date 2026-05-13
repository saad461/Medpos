'use client'

import { useState, useEffect } from 'react'
import { WelcomeModal } from './welcome-modal'
import { GuidedTour } from './guided-tour'
import { OnboardingChecklist } from './onboarding-checklist'
import { PageLoading } from '@/components/shared/page-loading'

interface OnboardingContainerProps {
  storeName: string
}

export function OnboardingContainer({ storeName }: OnboardingContainerProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [startTour, setStartTour] = useState(false)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/onboarding/progress')
      const json = await res.json()
      setData(json)

      if (json.progress && !json.progress.tour_completed && !json.progress.tour_skipped && !json.progress.setup_complete) {
          const createdAt = new Date(json.progress.created_at).getTime()
          const now = new Date().getTime()
          if (now - createdAt < 24 * 60 * 60 * 1000) {
            setShowWelcome(true)
          }
      }
    } catch (error) {
      console.error('Failed to fetch onboarding progress', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) return <PageLoading message="Preparing your dashboard..." />
  if (!data) return null

  return (
    <>
      {showWelcome && (
        <WelcomeModal
          storeName={storeName}
          onStartTour={() => {
            setShowWelcome(false)
            setStartTour(true)
          }}
          onDismiss={() => {
            setShowWelcome(false)
          }}
        />
      )}

      {startTour && (
        <GuidedTour
          autoStart={true}
          onComplete={() => setStartTour(false)}
          onSkip={() => setStartTour(false)}
        />
      )}

      {!data.progress.setup_complete && (
        <OnboardingChecklist
          progress={data.progress}
          checklist={data.checklist}
          summary={data.summary}
        />
      )}
    </>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import Shepherd from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'
import { TOUR_STEPS } from '@/lib/onboarding/steps'

interface GuidedTourProps {
  autoStart?: boolean
  onComplete?: () => void
  onSkip?: () => void
}

export function GuidedTour({
  autoStart = false,
  onComplete,
  onSkip,
}: GuidedTourProps) {
  const tourRef = useRef<Shepherd.Tour | null>(null)

  useEffect(() => {
    if (!document.getElementById('shepherd-overrides')) {
      const style = document.createElement('style')
      style.id = 'shepherd-overrides'
      style.textContent = `
        .shepherd-element {
          border-radius: 12px !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
          max-width: 380px !important;
          border: none !important;
          z-index: 9999 !important;
        }
        .shepherd-header {
          background: #1E3A5F !important;
          border-radius: 12px 12px 0 0 !important;
          padding: 16px 20px !important;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .shepherd-title {
          color: white !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          display: flex;
          justify-content: space-between;
          width: 100%;
          align-items: center;
        }
        .shepherd-text {
          padding: 16px 20px !important;
          font-size: 14px !important;
          color: #1E293B !important;
          line-height: 1.6 !important;
        }
        .shepherd-button-primary {
          background: #1E3A5F !important;
          color: white !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          font-weight: 500 !important;
          cursor: pointer;
        }
        .shepherd-button-secondary {
          color: #64748B !important;
          background: transparent !important;
          padding: 8px 16px !important;
          font-weight: 500 !important;
          cursor: pointer;
        }
        .shepherd-progress {
          color: rgba(255, 255, 255, 0.7) !important;
          font-size: 12px !important;
          font-weight: 400 !important;
        }
        .shepherd-footer {
          padding: 0 20px 20px !important;
        }
        .shepherd-progress-bar-container {
          height: 3px;
          background: #E2E8F0;
          border-radius: 0 0 12px 12px;
          overflow: hidden;
        }
      `
      document.head.appendChild(style)
    }

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'medpos-tour-step',
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
    })

    TOUR_STEPS.forEach((stepDef, index) => {
      tour.addStep({
        id: stepDef.id,
        title: `
          <span>${stepDef.title}</span>
          <span class="shepherd-progress">${stepDef.stepNumber}</span>
        `,
        text: stepDef.text,
        attachTo: stepDef.attachTo,
        showOn: stepDef.showOn,
        buttons: buildButtons(stepDef.buttons, tour, onComplete, onSkip),
        when: {
          show() {
            const content = (this as any).el.querySelector('.shepherd-content')
            if (content && !content.querySelector('.shepherd-progress-bar-container')) {
              const progressContainer = document.createElement('div')
              progressContainer.className = 'shepherd-progress-bar-container'

              const fill = document.createElement('div')
              fill.style.cssText = `
                height: 100%;
                width: ${((index + 1) / TOUR_STEPS.length) * 100}%;
                background: #0EA5E9;
                transition: width 0.3s ease;
              `
              progressContainer.appendChild(fill)
              content.appendChild(progressContainer)
            }
          }
        }
      })
    })

    tour.on('complete', () => {
      onComplete?.()
      fetch('/api/onboarding/progress', {
        method: 'POST',
        body: JSON.stringify({ action: 'complete_tour' }),
      })
    })

    tour.on('cancel', () => {
      onSkip?.()
      fetch('/api/onboarding/progress', {
        method: 'POST',
        body: JSON.stringify({ action: 'skip_tour' }),
      })
    })

    tourRef.current = tour

    if (autoStart) {
      setTimeout(() => tour.start(), 500)
    }

    return () => {
      tour.complete()
    }
  }, [autoStart, onComplete, onSkip])

  return null
}

function buildButtons(
  types: string[],
  tour: Shepherd.Tour,
  onComplete?: () => void,
  onSkip?: () => void
) {
  return types.map(type => {
    switch(type) {
      case 'next':
        return {
          text: 'Next →',
          action: tour.next,
          classes: 'shepherd-button-primary',
        }
      case 'back':
        return {
          text: '← Back',
          action: tour.back,
          classes: 'shepherd-button-secondary',
        }
      case 'skip':
        return {
          text: 'Skip Tour',
          action: () => { tour.cancel(); onSkip?.() },
          classes: 'shepherd-button-secondary',
        }
      case 'finish':
        return {
          text: '🎉 Done!',
          action: () => { tour.complete(); onComplete?.() },
          classes: 'shepherd-button-primary',
        }
      default:
        return {
            text: type,
            action: tour.next,
            classes: 'shepherd-button-primary'
        }
    }
  })
}

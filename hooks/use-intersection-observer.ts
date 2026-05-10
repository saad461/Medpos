'use client'

import { useEffect, useState, useRef } from 'react'

export function useIntersectionObserver(options: IntersectionObserverInit = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const targetRef = useRef<any>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true)
        if (targetRef.current) {
          observer.unobserve(targetRef.current)
        }
      }
    }, {
      threshold: 0.1,
      ...options
    })

    const target = targetRef.current
    if (target) {
      observer.observe(target)
    }

    return () => {
      if (target) {
        observer.unobserve(target)
      }
    }
  }, [options])

  return { targetRef, isIntersecting }
}

// components/shared/crisp-chat.tsx

'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

declare global {
  interface Window {
    $crisp: any[]
    CRISP_WEBSITE_ID: string
  }
}

export function CrispChat() {
  const { user, userName, userEmail, tenantId, role } = useAuth()

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID) return

    // Initialize Crisp
    window.$crisp = []
    window.CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID

    const script = document.createElement('script')
    script.src = 'https://client.crisp.chat/l.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://client.crisp.chat/l.js"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
      const crispContainer = document.getElementById('crisp-chatbox')
      if (crispContainer) {
          crispContainer.remove()
      }
    }
  }, [])

  useEffect(() => {
    // Set user data when available
    if (user && typeof window !== 'undefined') {
      const pushToCrisp = () => {
          if (window.$crisp) {
            if (userEmail) {
                window.$crisp.push(['set', 'user:email', userEmail])
              }
              if (userName) {
                window.$crisp.push(['set', 'user:nickname', userName])
              }
              // Set custom data for support context
              window.$crisp.push(['set', 'session:data', [[
                ['tenant_id', tenantId || 'unknown'],
                ['role', role || 'unknown'],
                ['plan', 'unknown'],
              ]]])
          }
      }

      if (window.$crisp) {
          pushToCrisp()
      }
    }
  }, [user, userName, userEmail, tenantId, role])

  return null
}

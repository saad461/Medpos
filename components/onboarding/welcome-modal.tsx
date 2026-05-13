'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Package, Receipt, BarChart3, ChevronRight } from "lucide-react"
import Link from "next/link"
import { TUTORIAL_VIDEO_URL } from "@/lib/constants"

interface WelcomeModalProps {
  storeName: string
  onStartTour: () => void
  onDismiss: () => void
}

export function WelcomeModal({ storeName, onStartTour, onDismiss }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(true)

  const renderConfetti = () => {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#1E3A5F', '#0EA5E9', '#059669', '#D97706', '#DC2626'][Math.floor(Math.random() * 5)],
              animationDelay: `${Math.random() * 3}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-300">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {renderConfetti()}

        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 hover:rotate-0 transition-transform">
             <div className="w-8 h-8 bg-white rounded-sm rotate-45" />
          </div>

          <h2 className="text-3xl font-bold text-primary mb-2">Welcome to MedPOS! 🎉</h2>
          <p className="text-muted-foreground text-lg mb-8">
            <span className="font-semibold text-primary">{storeName}</span> is ready to go
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10 w-full">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-2">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <span className="text-xs font-medium">25,000+ medicines</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-2">
                <Receipt className="h-6 w-6 text-success" />
              </div>
              <span className="text-xs font-medium">Fast POS Billing</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mb-2">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
              <span className="text-xs font-medium">Rich Reports</span>
            </div>
          </div>

          <div className="space-y-4 w-full">
            <Button
              className="w-full h-12 text-lg font-semibold shadow-md"
              onClick={() => {
                setIsOpen(false)
                onStartTour()
              }}
            >
              Let's get you started
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 text-muted-foreground"
              onClick={() => {
                setIsOpen(false)
                onDismiss()
              }}
            >
              Explore on My Own
            </Button>

            <p className="text-xs text-muted-foreground pt-2">
              You can start the tour anytime from the Help menu
            </p>
          </div>

          <div className="mt-8 pt-6 border-t w-full">
            <Link
              href={TUTORIAL_VIDEO_URL}
              target="_blank"
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              Watch Urdu Tutorial Video <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          top: -10px;
          animation: fall 3s linear forwards;
        }
      `}</style>
    </div>
  )
}

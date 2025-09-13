"use client"

import { useEffect, useRef, useState } from "react"
import type { PrescriberResult } from "@/lib/db/queries"

interface SonarMapProps {
  userLocation: { lat: number; lng: number } | null
  prescribers: PrescriberResult[]
  selectedPrescriber: string | null
  onPrescriberSelect: (npi: string | null) => void
  isSearching: boolean
  searchQuery: string
}

export function SonarMap({
  userLocation,
  prescribers,
  selectedPrescriber,
  onPrescriberSelect,
  isSearching,
  searchQuery,
}: SonarMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [sonarActive, setSonarActive] = useState(false)
  const [revealedPrescribers, setRevealedPrescribers] = useState<Set<string>>(new Set())

  // Trigger sonar pulse when search starts
  useEffect(() => {
    if (isSearching) {
      setSonarActive(true)
      setRevealedPrescribers(new Set())
    } else if (prescribers.length > 0) {
      // Reveal prescribers with staggered animation
      const timer = setTimeout(() => {
        prescribers.forEach((prescriber, index) => {
          setTimeout(() => {
            setRevealedPrescribers((prev) => new Set([...prev, prescriber.npi]))
          }, index * 200)
        })
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isSearching, prescribers])

  // Stop sonar pulse after animation
  useEffect(() => {
    if (sonarActive) {
      const timer = setTimeout(() => setSonarActive(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [sonarActive])

  const getGlowColor = (matchScore: number) => {
    if (matchScore >= 80) return "shadow-[0_0_20px_var(--color-prescriber-glow-high)]"
    if (matchScore >= 60) return "shadow-[0_0_20px_var(--color-prescriber-glow-medium)]"
    return "shadow-[0_0_20px_var(--color-prescriber-glow-low)]"
  }

  const getGlowBg = (matchScore: number) => {
    if (matchScore >= 80) return "bg-green-500"
    if (matchScore >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div ref={mapRef} className="relative w-full h-full bg-molecular-bg overflow-hidden">
      {sonarActive && userLocation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 border-2 border-accent/50 rounded-full sonar-pulse"
              style={{
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {userLocation && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-4 h-4 bg-accent rounded-full shadow-[0_0_20px_var(--color-accent)] animate-pulse" />
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-accent-foreground bg-accent/90 px-2 py-1 rounded whitespace-nowrap">
            Your Location
          </div>
        </div>
      )}

      {prescribers.map((prescriber) => {
        const isRevealed = revealedPrescribers.has(prescriber.npi)
        const isSelected = selectedPrescriber === prescriber.npi

        // Calculate position relative to user location (simplified positioning)
        const offsetX = (prescriber.coordinates.lng - (userLocation?.lng || 0)) * 1000
        const offsetY = (userLocation?.lat || 0 - prescriber.coordinates.lat) * 1000

        return (
          <div
            key={prescriber.npi}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 cursor-pointer z-10 ${
              isRevealed ? "opacity-100 scale-100" : "opacity-0 scale-0"
            } ${isSelected ? "z-30" : ""}`}
            style={{
              left: `calc(50% + ${Math.max(-200, Math.min(200, offsetX))}px)`,
              top: `calc(50% + ${Math.max(-200, Math.min(200, offsetY))}px)`,
            }}
            onClick={() => onPrescriberSelect(prescriber.npi)}
          >
            <div
              className={`w-3 h-3 rounded-full prescriber-glow ${getGlowBg(prescriber.matchScore)} ${getGlowColor(prescriber.matchScore)} ${
                isSelected ? "scale-150" : "hover:scale-125"
              } transition-transform duration-200`}
            />

            {/* Match score indicator */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-foreground bg-card/90 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {prescriber.matchScore}%
            </div>
          </div>
        )
      })}

      {isSearching && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-foreground font-medium">Scanning for {searchQuery} prescribers...</p>
            <p className="text-muted-foreground text-sm">Sonar pulse active</p>
          </div>
        </div>
      )}

      {!isSearching && prescribers.length === 0 && searchQuery && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-muted rounded-full flex items-center justify-center mb-4 mx-auto">
              <div className="w-8 h-8 bg-muted rounded-full" />
            </div>
            <p className="text-foreground font-medium mb-2">No prescribers found</p>
            <p className="text-muted-foreground text-sm">
              Try expanding your search radius or different pharmaceutical
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

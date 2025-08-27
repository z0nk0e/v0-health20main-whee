"use client"

import { useEffect, useRef, useState } from "react"

export function PrescriptionParallax() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)

      // Show prescription pad when user scrolls past hero section
      if (window.scrollY > window.innerHeight * 0.3) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Calculate animation progress based on scroll
  const progress = Math.min((scrollY - window.innerHeight * 0.3) / (window.innerHeight * 2), 1)
  const opacity = Math.min(progress * 2, 0.3) // Reduced max opacity to be less obtrusive
  const scale = 0.6 + progress * 0.2 // Smaller scale to take up less space
  const translateY = (1 - progress) * 50 // Reduced movement range
  const translateX = Math.sin(progress * Math.PI * 0.5) * 20 // Added subtle horizontal floating motion

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden" // Added overflow-hidden
      style={{
        opacity: isVisible ? opacity : 0,
        transition: "opacity 0.3s ease-out",
      }}
    >
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full flex items-center justify-center"
        style={{
          transform: `translateY(${translateY}px) translateX(${translateX}px) scale(${scale}) rotate(${5 + progress * 10}deg)`, // Added rotation animation
          transition: "transform 0.1s ease-out",
        }}
      >
        <div className="relative animate-float">
          <div className="absolute inset-0 bg-blue-400/20 rounded-lg blur-xl scale-110 animate-pulse"></div>

          {/* Prescription pad */}
          <div className="relative w-80 h-[450px] bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-200/50 p-5 transform">
            <div className="absolute inset-0 rounded-lg shadow-inner opacity-20"></div>

            {/* Header */}
            <div className="relative border-b-2 border-blue-600 pb-3 mb-5">
              <div className="text-center">
                <h3 className="text-lg font-bold text-blue-600">RX Prescribers</h3>
                <p className="text-xs text-gray-600">Healthcare Provider Network</p>
              </div>
            </div>

            {/* Prescription content that fills in based on scroll */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Patient:</span>
                <div className="flex-1 border-b border-gray-300 relative">
                  <span
                    className="absolute left-0 text-sm text-gray-800 transition-all duration-1000"
                    style={{
                      opacity: progress > 0.2 ? 1 : 0,
                      transform: `translateX(${progress > 0.2 ? 0 : -20}px)`,
                    }}
                  >
                    John Smith
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Date:</span>
                <div className="flex-1 border-b border-gray-300 relative">
                  <span
                    className="absolute left-0 text-sm text-gray-800 transition-all duration-1000 delay-200"
                    style={{
                      opacity: progress > 0.3 ? 1 : 0,
                      transform: `translateX(${progress > 0.3 ? 0 : -20}px)`,
                    }}
                  >
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <div className="text-sm font-medium text-gray-700 mb-2">Rx:</div>
                <div className="space-y-2">
                  <div
                    className="text-lg font-handwriting text-blue-800 transition-all duration-1000 delay-500"
                    style={{
                      opacity: progress > 0.5 ? 1 : 0,
                      transform: `translateY(${progress > 0.5 ? 0 : 10}px)`,
                    }}
                  >
                    Lisinopril 10mg
                  </div>
                  <div
                    className="text-sm text-gray-600 transition-all duration-1000 delay-700"
                    style={{
                      opacity: progress > 0.6 ? 1 : 0,
                      transform: `translateY(${progress > 0.6 ? 0 : 10}px)`,
                    }}
                  >
                    Take once daily
                  </div>
                  <div
                    className="text-sm text-gray-600 transition-all duration-1000 delay-900"
                    style={{
                      opacity: progress > 0.7 ? 1 : 0,
                      transform: `translateY(${progress > 0.7 ? 0 : 10}px)`,
                    }}
                  >
                    30 day supply
                  </div>
                </div>
              </div>

              {/* Doctor signature area */}
              <div className="mt-12 pt-4 border-t border-gray-200/50">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Provider:</div>
                    <div
                      className="text-lg font-signature text-blue-700 transition-all duration-1000 delay-1100"
                      style={{
                        opacity: progress > 0.8 ? 1 : 0,
                        transform: `translateX(${progress > 0.8 ? 0 : -30}px)`,
                      }}
                    >
                      Dr. Sarah Johnson
                    </div>
                  </div>
                  <div
                    className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center transition-all duration-1000 delay-1300"
                    style={{
                      opacity: progress > 0.9 ? 1 : 0,
                      transform: `scale(${progress > 0.9 ? 1 : 0.5})`,
                    }}
                  >
                    <span className="text-xs text-blue-600 font-bold">VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>

            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-400/60 rounded-full"
                style={{
                  left: `${15 + i * 12}%`,
                  top: `${25 + (i % 4) * 15}%`,
                  animation: `float ${2 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                  opacity: progress > 0.4 ? 0.8 : 0,
                  transition: "opacity 0.5s ease-out",
                }}
              />
            ))}

            <div className="absolute -top-2 -right-2 w-6 h-6 text-blue-400/30 animate-spin-slow">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

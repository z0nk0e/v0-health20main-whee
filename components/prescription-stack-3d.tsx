"use client"

import { useEffect, useRef, useState } from "react"

export function PrescriptionStack3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)

      // Show prescription stack when user scrolls past hero section
      if (window.scrollY > window.innerHeight * 0.2) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Calculate animation progress based on scroll
  const progress = Math.min((scrollY - window.innerHeight * 0.2) / (window.innerHeight * 3), 1)

  // Create prescription pad data
  const prescriptions = [
    { patient: "Sarah Johnson", medication: "Metformin 500mg", doctor: "Dr. Smith", color: "bg-blue-50" },
    { patient: "Michael Chen", medication: "Lisinopril 10mg", doctor: "Dr. Wilson", color: "bg-green-50" },
    { patient: "Emma Davis", medication: "Atorvastatin 20mg", doctor: "Dr. Brown", color: "bg-purple-50" },
    { patient: "James Wilson", medication: "Omeprazole 40mg", doctor: "Dr. Garcia", color: "bg-orange-50" },
    { patient: "Lisa Anderson", medication: "Amlodipine 5mg", doctor: "Dr. Taylor", color: "bg-pink-50" },
  ]

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.5s ease-out",
      }}
    >
      {/* 3D Container */}
      <div
        className="absolute right-8 top-1/2 -translate-y-1/2 w-80 h-96"
        style={{
          perspective: "1000px",
          perspectiveOrigin: "center center",
        }}
      >
        {prescriptions.map((prescription, index) => {
          // Calculate individual card animations
          const cardProgress = Math.max(0, Math.min(1, (progress - index * 0.1) * 2))
          const rotateX = (1 - cardProgress) * 45 - index * 5
          const rotateY = (1 - cardProgress) * 15 + Math.sin(progress * Math.PI + index) * 5
          const translateZ = cardProgress * (index * -20) + (1 - cardProgress) * -100
          const translateY = (1 - cardProgress) * 50 + index * -10
          const translateX = Math.sin(progress * Math.PI * 0.5 + index * 0.5) * 10
          const scale = 0.7 + cardProgress * 0.3
          const opacity = Math.min(cardProgress * 2, 0.9)

          return (
            <div
              key={index}
              className="absolute inset-0"
              style={{
                transform: `
                  translateX(${translateX}px) 
                  translateY(${translateY}px) 
                  translateZ(${translateZ}px) 
                  rotateX(${rotateX}deg) 
                  rotateY(${rotateY}deg) 
                  scale(${scale})
                `,
                transformStyle: "preserve-3d",
                opacity,
                transition: "transform 0.1s ease-out, opacity 0.3s ease-out",
                zIndex: prescriptions.length - index,
              }}
            >
              {/* Prescription Pad */}
              <div
                className={`relative w-full h-full ${prescription.color} backdrop-blur-sm rounded-xl shadow-2xl border border-white/50 p-4 transform-gpu`}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>

                {/* Header */}
                <div className="relative border-b-2 border-blue-600/70 pb-2 mb-4">
                  <div className="text-center">
                    <h3 className="text-sm font-bold text-blue-700">RX Prescribers</h3>
                    <p className="text-xs text-gray-600">Healthcare Network</p>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700">Patient:</span>
                    <div className="flex-1 border-b border-gray-300">
                      <span
                        className="font-handwriting text-gray-800 transition-all duration-1000"
                        style={{
                          opacity: cardProgress > 0.3 ? 1 : 0,
                          transform: `translateX(${cardProgress > 0.3 ? 0 : -10}px)`,
                        }}
                      >
                        {prescription.patient}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700">Date:</span>
                    <div className="flex-1 border-b border-gray-300">
                      <span
                        className="text-gray-800 transition-all duration-1000 delay-200"
                        style={{
                          opacity: cardProgress > 0.4 ? 1 : 0,
                          transform: `translateX(${cardProgress > 0.4 ? 0 : -10}px)`,
                        }}
                      >
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="font-medium text-gray-700 mb-1">Rx:</div>
                    <div
                      className="text-sm font-handwriting text-blue-800 transition-all duration-1000 delay-400"
                      style={{
                        opacity: cardProgress > 0.6 ? 1 : 0,
                        transform: `translateY(${cardProgress > 0.6 ? 0 : 5}px)`,
                      }}
                    >
                      {prescription.medication}
                    </div>
                    <div
                      className="text-xs text-gray-600 mt-1 transition-all duration-1000 delay-600"
                      style={{
                        opacity: cardProgress > 0.7 ? 1 : 0,
                      }}
                    >
                      Take as directed • 30 day supply
                    </div>
                  </div>

                  {/* Doctor signature */}
                  <div className="mt-6 pt-2 border-t border-gray-200/50">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs text-gray-500">Provider:</div>
                        <div
                          className="text-sm font-signature text-blue-700 transition-all duration-1000 delay-800"
                          style={{
                            opacity: cardProgress > 0.8 ? 1 : 0,
                            transform: `translateX(${cardProgress > 0.8 ? 0 : -15}px)`,
                          }}
                        >
                          {prescription.doctor}
                        </div>
                      </div>
                      <div
                        className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center transition-all duration-1000 delay-1000"
                        style={{
                          opacity: cardProgress > 0.9 ? 1 : 0,
                          transform: `scale(${cardProgress > 0.9 ? 1 : 0.3})`,
                        }}
                      >
                        <span className="text-xs text-blue-600 font-bold">✓</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating particles */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
                    style={{
                      left: `${20 + i * 20}%`,
                      top: `${30 + (i % 2) * 20}%`,
                      animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`,
                      opacity: cardProgress > 0.5 ? 0.6 : 0,
                      transition: "opacity 0.5s ease-out",
                    }}
                  />
                ))}

                {/* Corner decoration */}
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 text-blue-400/30"
                  style={{
                    animation: `spin ${3 + index}s linear infinite`,
                    opacity: cardProgress > 0.6 ? 0.7 : 0,
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Background glow effect */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-blue-400/10 via-purple-400/5 to-transparent rounded-full blur-3xl"
        style={{
          opacity: progress * 0.5,
          transform: `scale(${1 + progress * 0.5}) rotate(${progress * 45}deg)`,
        }}
      />
    </div>
  )
}

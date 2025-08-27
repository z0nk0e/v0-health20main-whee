"use client"

import { useEffect, useRef } from "react"

export default function FlowingPrescriptions() {
  const containerRef = useRef<HTMLDivElement>(null)
  const prescriptionsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create prescription pad elements
    const prescriptionData = [
      { patient: "Sarah Johnson", medication: "Lisinopril 10mg", doctor: "Dr. Smith" },
      { patient: "Michael Chen", medication: "Metformin 500mg", doctor: "Dr. Williams" },
      { patient: "Emma Davis", medication: "Atorvastatin 20mg", doctor: "Dr. Brown" },
      { patient: "James Wilson", medication: "Omeprazole 40mg", doctor: "Dr. Jones" },
      { patient: "Lisa Garcia", medication: "Amlodipine 5mg", doctor: "Dr. Miller" },
    ]

    // Clear existing prescriptions
    container.innerHTML = ""
    prescriptionsRef.current = []

    // Create prescription elements
    prescriptionData.forEach((data, index) => {
      const prescription = document.createElement("div")
      prescription.className = "flowing-prescription"
      prescription.innerHTML = `
        <div class="prescription-header">
          <div class="prescription-logo">Rx</div>
          <div class="prescription-info">
            <div class="doctor-name">${data.doctor}</div>
            <div class="clinic-name">Medical Center</div>
          </div>
        </div>
        <div class="prescription-body">
          <div class="patient-name">Patient: ${data.patient}</div>
          <div class="medication-line">
            <span class="rx-symbol">℞</span>
            <span class="medication">${data.medication}</span>
          </div>
          <div class="instructions">Take once daily with food</div>
          <div class="signature-line">
            <div class="signature">Dr. Signature</div>
          </div>
        </div>
      `

      container.appendChild(prescription)
      prescriptionsRef.current.push(prescription)
    })

    // Scroll animation logic
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      prescriptionsRef.current.forEach((prescription, index) => {
        const progress = scrollY / (documentHeight - windowHeight)
        const staggeredProgress = Math.max(0, Math.min(1, progress - index * 0.1))

        // Calculate flowing path
        const baseY = staggeredProgress * (windowHeight * 3)
        const waveX = Math.sin(staggeredProgress * Math.PI * 4 + index) * 200
        const waveY = Math.cos(staggeredProgress * Math.PI * 2 + index) * 50

        // Calculate rotation and scale
        const rotation = staggeredProgress * 360 + index * 45
        const scale = 0.6 + Math.sin(staggeredProgress * Math.PI * 2) * 0.2

        // Apply transforms
        prescription.style.transform = `
          translate3d(${50 + waveX}%, ${baseY - windowHeight + waveY}px, 0)
          rotate(${rotation}deg)
          scale(${scale})
        `

        // Opacity based on position
        const opacity = Math.sin(staggeredProgress * Math.PI) * 0.8 + 0.2
        prescription.style.opacity = opacity.toString()
      })
    }

    // Initial setup
    handleScroll()

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="flowing-prescriptions-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        overflow: "hidden",
      }}
    />
  )
}

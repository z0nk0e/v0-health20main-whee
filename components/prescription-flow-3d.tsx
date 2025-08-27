"use client"

import { useEffect, useRef } from "react"

export default function PrescriptionFlow3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const prescriptionsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      prescriptionsRef.current.forEach((prescription, index) => {
        if (!prescription) return

        const progress = scrollY / (documentHeight - windowHeight)
        const staggeredProgress = Math.max(0, Math.min(1, progress - index * 0.08))

        const baseX = -300 + staggeredProgress * (window.innerWidth + 600)
        const curveY = Math.sin(staggeredProgress * Math.PI * 3) * 150
        const flowY = staggeredProgress * 300 - 150

        const rotateX = Math.sin(staggeredProgress * Math.PI * 2) * 25
        const rotateY = Math.cos(staggeredProgress * Math.PI * 1.5) * 35
        const rotateZ = staggeredProgress * 20 - 10
        const scale = 0.7 + Math.sin(staggeredProgress * Math.PI) * 0.4

        // Apply transforms
        prescription.style.transform = `
          translate3d(${baseX}px, ${flowY + curveY}px, ${index * -30}px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          rotateZ(${rotateZ}deg)
          scale(${scale})
        `

        const opacity = Math.sin(staggeredProgress * Math.PI) * 0.9 + 0.1
        const blur = (1 - opacity) * 3
        prescription.style.opacity = opacity.toString()
        prescription.style.filter = `blur(${blur}px) saturate(1.2) contrast(1.1)`
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const prescriptionData = [
    {
      patient: "Sarah Johnson",
      medication: "Lisinopril 10mg",
      doctor: "Dr. Michael Chen",
      date: "01/15/2024",
      gradient: "from-cyan-400 via-blue-500 to-purple-600",
      pattern:
        "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)",
      accent: "border-cyan-300/40",
    },
    {
      patient: "Robert Davis",
      medication: "Metformin 500mg",
      doctor: "Dr. Lisa Rodriguez",
      date: "01/16/2024",
      gradient: "from-purple-400 via-pink-500 to-red-500",
      pattern:
        "radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.3) 0%, transparent 50%), radial-gradient(circle at 60% 60%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)",
      accent: "border-purple-300/40",
    },
    {
      patient: "Emily Wilson",
      medication: "Atorvastatin 20mg",
      doctor: "Dr. James Park",
      date: "01/17/2024",
      gradient: "from-emerald-400 via-teal-500 to-cyan-600",
      pattern:
        "radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.3) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)",
      accent: "border-emerald-300/40",
    },
    {
      patient: "David Brown",
      medication: "Omeprazole 40mg",
      doctor: "Dr. Maria Garcia",
      date: "01/18/2024",
      gradient: "from-orange-400 via-red-500 to-pink-600",
      pattern:
        "radial-gradient(circle at 50% 20%, rgba(251, 146, 60, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.3) 0%, transparent 50%)",
      accent: "border-orange-300/40",
    },
    {
      patient: "Jennifer Lee",
      medication: "Sertraline 50mg",
      doctor: "Dr. Kevin Wong",
      date: "01/19/2024",
      gradient: "from-indigo-400 via-blue-500 to-teal-600",
      pattern:
        "radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(20, 184, 166, 0.3) 0%, transparent 50%)",
      accent: "border-indigo-300/40",
    },
    {
      patient: "Michael Taylor",
      medication: "Amlodipine 5mg",
      doctor: "Dr. Sarah Kim",
      date: "01/20/2024",
      gradient: "from-violet-400 via-purple-500 to-indigo-600",
      pattern:
        "radial-gradient(circle at 30% 60%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 40%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)",
      accent: "border-violet-300/40",
    },
    {
      patient: "Amanda White",
      medication: "Levothyroxine 75mcg",
      doctor: "Dr. John Smith",
      date: "01/21/2024",
      gradient: "from-rose-400 via-pink-500 to-purple-600",
      pattern:
        "radial-gradient(circle at 60% 20%, rgba(244, 114, 182, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)",
      accent: "border-rose-300/40",
    },
    {
      patient: "Christopher Moore",
      medication: "Gabapentin 300mg",
      doctor: "Dr. Rachel Adams",
      date: "01/22/2024",
      gradient: "from-amber-400 via-orange-500 to-red-600",
      pattern:
        "radial-gradient(circle at 80% 40%, rgba(245, 158, 11, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 60%, rgba(239, 68, 68, 0.3) 0%, transparent 50%)",
      accent: "border-amber-300/40",
    },
  ]

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {prescriptionData.map((prescription, index) => (
        <div
          key={index}
          ref={(el) => {
            if (el) prescriptionsRef.current[index] = el
          }}
          className={`absolute w-80 h-96 rounded-xl shadow-2xl prescription-flow-card ${prescription.accent}`}
          style={{
            background: `linear-gradient(135deg, ${prescription.gradient
              .replace("from-", "")
              .replace("via-", "")
              .replace("to-", "")
              .split(" ")
              .map((color) => `var(--${color.replace("-", "-color-")})`)
              .join(", ")}), ${prescription.pattern}`,
            backdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            transformStyle: "preserve-3d",
            willChange: "transform, opacity",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
          }}
        >
          <div
            className="absolute inset-0 rounded-xl opacity-30"
            style={{
              background: prescription.pattern,
              mixBlendMode: "overlay",
            }}
          />

          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-br ${prescription.gradient} opacity-60`}
            style={{
              animation: "prescription-glow 4s ease-in-out infinite alternate",
            }}
          />

          <div className="relative z-10 p-6 border-b border-white/30">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-serif text-lg font-bold drop-shadow-lg">RX Prescribers</h3>
                <p className="text-white/80 text-sm drop-shadow">Healthcare Network</p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm drop-shadow">Date: {prescription.date}</p>
                <p className="text-white/80 text-sm drop-shadow">ID: #{1000 + index}</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 p-6 space-y-4">
            <div>
              <label className="text-white/70 text-sm block mb-1 drop-shadow">Patient Name</label>
              <p className="text-white font-handwriting text-lg drop-shadow-lg">{prescription.patient}</p>
            </div>

            <div>
              <label className="text-white/70 text-sm block mb-1 drop-shadow">Medication</label>
              <p className="text-white font-handwriting text-xl font-medium drop-shadow-lg">
                {prescription.medication}
              </p>
            </div>

            <div>
              <label className="text-white/70 text-sm block mb-1 drop-shadow">Prescribing Physician</label>
              <p className="text-white font-handwriting text-lg drop-shadow-lg">{prescription.doctor}</p>
            </div>

            <div className="pt-4 border-t border-white/30">
              <label className="text-white/70 text-sm block mb-2 drop-shadow">Instructions</label>
              <p className="text-white/90 font-handwriting text-sm drop-shadow">
                Take one tablet daily with food. Continue as directed.
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 right-6 z-10">
            <div className="text-right">
              <div className="w-32 h-8 border-b-2 border-white/40 mb-1"></div>
              <p className="text-white/70 text-xs drop-shadow">Physician Signature</p>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
            <span className="text-white text-9xl font-bold" style={{ textShadow: "0 0 20px rgba(255, 255, 255, 0.3)" }}>
              Rx
            </span>
          </div>

          <div className="absolute inset-0 overflow-hidden rounded-xl">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                  animation: `float ${3 + i * 0.5}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

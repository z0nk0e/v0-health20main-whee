"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedText } from "./animated-text"

interface StatItemProps {
  value: string
  label: string
  description: string
  index: number
}

function StatItem({ value, label, description, index }: StatItemProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const getTargetValue = (value: string) => {
    const numericPart = Number.parseFloat(value.replace(/[^\d.]/g, ""))
    if (value.includes("M")) return numericPart * 1000000
    if (value.includes("K")) return numericPart * 1000
    return numericPart
  }

  const targetValue = getTargetValue(value)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2500 + index * 200 // Staggered timing
    const steps = 80
    const increment = targetValue / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= targetValue) {
        setCount(targetValue)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [targetValue, isVisible, index])

  const formatCount = (num: number) => {
    if (value.includes("M")) return `${(num / 1000000).toFixed(1)}M+`
    if (value.includes("K")) return `${Math.round(num / 1000)}K+`
    return `${Math.round(num)}+`
  }

  return (
    <Card
      ref={ref}
      className={`text-center transition-all duration-700 hover:shadow-xl hover:scale-105 group cursor-default ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <CardContent className="p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="text-3xl font-bold text-accent md:text-4xl transition-all duration-300 group-hover:scale-110">
              {formatCount(count)}
            </div>
            <div className="mt-2 font-semibold text-foreground group-hover:text-accent transition-colors">{label}</div>
            <div className="mt-1 text-sm text-muted-foreground">{description}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsSection() {
  const [sectionVisible, setSectionVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-12 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-accent/5 rounded-full blur-2xl animate-pulse" />
        <div
          className="absolute bottom-10 right-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container px-4 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-playfair text-3xl font-bold md:text-4xl">
            <AnimatedText
              text="Comprehensive Healthcare Database"
              animationType="bounce"
              delay={sectionVisible ? 0 : 1000}
              stagger={60}
              className={`transition-all duration-700 ${
                sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            />
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            <AnimatedText
              text="Access the most extensive database of prescription records and healthcare providers"
              animationType="fade"
              delay={sectionVisible ? 800 : 1800}
              stagger={20}
            />
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatItem
              value="3.0M+"
              label="Prescription Records"
              description="Comprehensive medication data"
              index={0}
            />
            <StatItem
              value="200K+"
              label="Healthcare Providers"
              description="Verified medical professionals"
              index={1}
            />
            <StatItem value="25K+" label="Medications" description="FDA-approved prescriptions" index={2} />
          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface AnimatedTextProps {
  text: string
  className?: string
  animationType?: "fade" | "slide" | "bounce" | "rotate" | "scale"
  delay?: number
  stagger?: number
}

export function AnimatedText({
  text,
  className = "",
  animationType = "fade",
  delay = 0,
  stagger = 50,
}: AnimatedTextProps) {
  const [isVisible, setIsVisible] = useState(false)
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      { threshold: 0.1 },
    )

    if (textRef.current) {
      observer.observe(textRef.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const getAnimationStyles = (index: number, type: string) => {
    const delayMs = index * stagger

    const baseStyle: React.CSSProperties = {
      transitionDelay: `${delayMs}ms`,
      transitionDuration: "700ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      display: "inline-block",
    }

    if (!isVisible) {
      switch (type) {
        case "slide":
          return { ...baseStyle, opacity: 0, transform: "translateY(32px)" }
        case "bounce":
          return { ...baseStyle, opacity: 0, transform: "translateY(16px) scale(0.95)" }
        case "rotate":
          return { ...baseStyle, opacity: 0, transform: "rotate(12deg)" }
        case "scale":
          return { ...baseStyle, opacity: 0, transform: "scale(0.5)" }
        default:
          return { ...baseStyle, opacity: 0 }
      }
    }

    return { ...baseStyle, opacity: 1, transform: "none" }
  }

  const getHoverClass = (type: string) => {
    switch (type) {
      case "bounce":
        return "hover:scale-110 hover:-translate-y-1"
      case "rotate":
        return "hover:rotate-3"
      case "scale":
        return "hover:scale-125"
      default:
        return ""
    }
  }

  return (
    <span ref={textRef} className={className}>
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`transition-all ${getHoverClass(animationType)} ${char === " " ? "w-2" : ""}`}
          style={getAnimationStyles(index, animationType)}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  )
}

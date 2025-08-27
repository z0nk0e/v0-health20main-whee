"use client"

import { useEffect } from "react"

export function ScrollAnimations() {
  useEffect(() => {
    // Custom cursor effect
    const cursor = document.createElement("div")
    cursor.className =
      "fixed w-4 h-4 bg-accent/30 rounded-full pointer-events-none z-50 transition-transform duration-150 ease-out"
    cursor.style.transform = "translate(-50%, -50%)"
    document.body.appendChild(cursor)

    const handleMouseMove = (e: MouseEvent) => {
      cursor.style.left = e.clientX + "px"
      cursor.style.top = e.clientY + "px"
    }

    const handleMouseEnter = () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1.5)"
      cursor.style.backgroundColor = "rgb(var(--accent) / 0.5)"
    }

    const handleMouseLeave = () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1)"
      cursor.style.backgroundColor = "rgb(var(--accent) / 0.3)"
    }

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove)

    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, [role="button"], input, .cursor-pointer')
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter)
      el.addEventListener("mouseleave", handleMouseLeave)
    })

    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = "smooth"

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter)
        el.removeEventListener("mouseleave", handleMouseLeave)
      })
      document.body.removeChild(cursor)
    }
  }, [])

  return null
}

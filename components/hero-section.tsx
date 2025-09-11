"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, Shield, Sparkles } from "@/lib/simple-icons"
import { SearchOverlay } from "./search-overlay"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleSearchFocus = () => {
    setIsSearchOverlayOpen(true)
  }

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/5 py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-accent/20 to-secondary/10 rounded-full blur-3xl animate-pulse transform-3d"
            style={{
              transform: `translate3d(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px, 0) rotateX(${mousePosition.y * 0.01}deg) rotateY(${mousePosition.x * 0.01}deg)`,
            }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-primary/15 to-accent/10 rounded-full blur-3xl animate-pulse transform-3d"
            style={{
              transform: `translate3d(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px, 0) rotateX(${mousePosition.y * -0.01}deg) rotateY(${mousePosition.x * -0.01}deg)`,
            }}
          />
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent/30 rounded-full animate-float" />
          <div
            className="absolute top-3/4 right-1/4 w-1 h-1 bg-secondary/40 rounded-full animate-float"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-accent/25 rounded-full animate-float"
            style={{ animationDelay: "4s" }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-5xl text-center">
            <Badge
              variant="secondary"
              className={`mb-8 px-6 py-3 text-sm font-medium glass-card border border-accent/20 transition-all duration-700 hover:scale-110 hover:shadow-xl hover:bg-accent/10 cursor-default ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <Sparkles className="w-4 h-4 mr-2 animate-pulse text-accent" />
              Trusted by 825K+ Healthcare Providers
            </Badge>

            <h1 className="font-serif leading-tight tracking-tight text-[clamp(28px,5.5vw,56px)]">
              Find <span className="font-extrabold text-indigo-600">Prescribers</span> for Your Medications
            </h1>

            <p
              className={`mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl leading-relaxed md:leading-normal transition-all duration-1000 delay-[1800ms] ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Search a database of 4.5M prescription records and connect with licensed providers in your area.
            </p>

            <Card
              className={`mx-auto mt-10 max-w-3xl p-6 glass-card border border-border/30 shadow-2xl transition-all duration-1000 delay-[2000ms] card-3d hover:shadow-3xl ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <form
                className="w-full"
                role="search"
                aria-label="Search for medication or ZIP code"
                onSubmit={(e) => {
                  e.preventDefault()
                  const trimmed = searchQuery.trim()
                  const zipMatch = trimmed.match(/^\d{5}(?:-\d{4})?$/)
                  if (zipMatch) {
                    setLocation(trimmed.slice(0, 5))
                    setSearchQuery("")
                  }
                  setIsSearchOverlayOpen(true)
                }}
              >
                <label htmlFor="hero-search" className="sr-only">
                  Search medication or ZIP code
                </label>
                <div className="flex rounded-md shadow-sm overflow-hidden">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="hero-search"
                      type="search"
                      name="q"
                      placeholder="Search medication or ZIP code"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 text-base border-border/30 focus:ring-2 focus:ring-accent/30"
                      aria-required="true"
                    />
                  </div>
                  <Button type="submit" className="px-5 h-14 bg-indigo-600 hover:bg-indigo-700">
                    Search
                  </Button>
                </div>
              </form>
            </Card>

            <div
              className={`mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 transition-all duration-1000 delay-[2200ms] ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              {[
                { icon: Shield, text: "HIPAA Compliant", delay: "delay-[2300ms]" },
                { icon: Clock, text: "Real-time Updates", delay: "delay-[2400ms]" },
                { icon: Search, text: "Verified Providers", delay: "delay-[2500ms]" },
              ].map(({ icon: Icon, text, delay }, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-center space-x-3 text-base text-muted-foreground glass-card p-4 rounded-xl border border-border/20 transition-all duration-700 hover:text-accent hover:scale-110 hover:shadow-lg cursor-default modern-hover ${delay} ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                >
                  <Icon className="h-5 w-5 text-accent transition-transform hover:rotate-12 hover:scale-125" />
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SearchOverlay
        isOpen={isSearchOverlayOpen}
        onClose={() => setIsSearchOverlayOpen(false)}
        initialQuery={searchQuery}
        initialLocation={location}
      />
    </>
  )
}

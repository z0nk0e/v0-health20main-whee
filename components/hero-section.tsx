"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Clock, Shield, Sparkles } from "lucide-react"
import { AnimatedText } from "./animated-text"
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
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <Badge
              variant="secondary"
              className={`mb-6 px-4 py-2 transition-all duration-700 hover:scale-105 hover:shadow-lg ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
              Trusted by 825K+ Healthcare Providers
            </Badge>

            <h1 className="font-playfair text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              <AnimatedText text="Find Healthcare Providers Who " animationType="slide" delay={200} stagger={30} />
              <span className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                <AnimatedText text="Prescribe" animationType="bounce" delay={800} stagger={80} />
              </span>
              <AnimatedText text=" Your Medications" animationType="fade" delay={1200} stagger={40} />
            </h1>

            <p
              className={`mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl transition-all duration-1000 delay-[1800ms] ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Connect with qualified healthcare providers in your area who prescribe the specific medications you need.
              Search our comprehensive database of over 4.5 million prescription records.
            </p>

            <Card
              className={`mx-auto mt-12 max-w-2xl p-6 shadow-xl transition-all duration-1000 delay-[2000ms] hover:shadow-2xl hover:scale-[1.02] ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="space-y-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
                  <Input
                    placeholder="Enter medication name (e.g., Metformin, Lisinopril, Adderall)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleSearchFocus}
                    className="pl-10 h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-accent/20 hover:border-accent/50 cursor-pointer"
                  />
                </div>

                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
                  <Input
                    placeholder="Enter your location (city, state, or ZIP code)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onFocus={handleSearchFocus}
                    className="pl-10 h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-accent/20 hover:border-accent/50 cursor-pointer"
                  />
                </div>

                <Button
                  size="lg"
                  className="w-full h-12 text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] group"
                  onClick={handleSearchFocus}
                >
                  <Search className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                  Find Providers Near Me
                </Button>
              </div>
            </Card>

            <div
              className={`mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 transition-all duration-1000 delay-[2200ms] ${
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
                  className={`flex items-center justify-center space-x-2 text-sm text-muted-foreground transition-all duration-700 hover:text-accent hover:scale-105 cursor-default ${delay} ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                >
                  <Icon className="h-4 w-4 text-accent transition-transform hover:rotate-12" />
                  <span>{text}</span>
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

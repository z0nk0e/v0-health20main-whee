"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Clock, Shield, Sparkles } from "@/lib/simple-icons"
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

            <h1 className="font-serif text-3xl font-bold tracking-tight md:text-6xl lg:text-7xl leading-tight md:leading-[1.1]">
              <AnimatedText text="Find Authorized" animationType="slide" delay={200} stagger={30} />
              <span className="kinetic-text bg-gradient-to-r from-accent via-secondary to-accent bg-clip-text text-transparent animate-gradient-x">
                <AnimatedText text=" Prescribers" animationType="bounce" delay={800} stagger={80} />
              </span>
              <br className="block" aria-hidden="true" />
              <AnimatedText text="of Your Specific" animationType="fade" delay={1200} stagger={40} />
              <br className="block md:hidden" aria-hidden="true" />
              <AnimatedText text=" Medications" animationType="fade" delay={1400} stagger={40} />
            </h1>

            <p
              className={`mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl leading-relaxed md:leading-normal transition-all duration-1000 delay-[1800ms] ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Connect with qualified healthcare providers in your area who prescribe the specific medications you need.
              Search our comprehensive database of over 4.5 million prescription records.
            </p>

            <Card
              className={`mx-auto mt-10 max-w-3xl p-6 glass-card border border-border/30 shadow-2xl transition-all duration-1000 delay-[2000ms] card-3d hover:shadow-3xl ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="space-y-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-all duration-300 group-focus-within:text-accent group-focus-within:scale-110" />
                  <Input
                    placeholder="Enter medication name (e.g., Metformin, Lisinopril, Adderall)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleSearchFocus}
                    className="pl-12 h-14 text-lg glass-card border-border/30 transition-all duration-300 focus:ring-2 focus:ring-accent/30 hover:border-accent/50 cursor-pointer hover:shadow-lg"
                  />
                </div>

                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-all duration-300 group-focus-within:text-accent group-focus-within:scale-110" />
                  <Input
                    placeholder="Enter your location (city, state, or ZIP code)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onFocus={handleSearchFocus}
                    className="pl-12 h-14 text-lg glass-card border-border/30 transition-all duration-300 focus:ring-2 focus:ring-accent/30 hover:border-accent/50 cursor-pointer hover:shadow-lg"
                  />
                </div>

                <Button
                  size="lg"
                  className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] group border-0 rounded-xl"
                  onClick={handleSearchFocus}
                >
                  <Search className="w-5 h-5 mr-3 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                  Find Providers Near Me
                </Button>
              </div>
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

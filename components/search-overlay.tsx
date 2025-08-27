"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, X, Lightbulb, TrendingUp, Clock } from "lucide-react"
import { RxPrescribersAPI, type SearchResponse } from "@/lib/api"
import { SearchResults } from "@/components/search-results"

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
  initialLocation?: string
}

export function SearchOverlay({ isOpen, onClose, initialQuery = "", initialLocation = "" }: SearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const popularMedications = [
    "Metformin",
    "Lisinopril",
    "Atorvastatin",
    "Levothyroxine",
    "Amlodipine",
    "Metoprolol",
    "Omeprazole",
    "Losartan",
  ]

  const searchTips = [
    { icon: Lightbulb, text: "Try generic names like 'Metformin' instead of brand names" },
    { icon: TrendingUp, text: "Popular searches: Diabetes medications, Blood pressure meds" },
    { icon: Clock, text: "Results updated daily with new provider information" },
  ]

  const handleSearch = async () => {
    if (!searchQuery.trim() || !location.trim()) {
      return
    }

    setIsLoading(true)
    setShowResults(true)

    try {
      console.log("[v0] Starting search:", { searchQuery, location })

      setLoadingMessage(`Finding providers of ${searchQuery}...`)
      await new Promise((resolve) => setTimeout(resolve, 800))

      setLoadingMessage("Narrowing down to state...")
      await new Promise((resolve) => setTimeout(resolve, 600))

      setLoadingMessage("Filtering for zipcode radius...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      setLoadingMessage("Finalizing results...")
      await new Promise((resolve) => setTimeout(resolve, 800))

      const zipMatch = location.match(/\b\d{5}\b/)
      const zip = zipMatch ? zipMatch[0] : location

      const results = await RxPrescribersAPI.searchPrescribers({
        drug: searchQuery,
        zip: zip,
        radius: 25,
      })

      console.log("[v0] Search results:", results)
      setSearchResults(results)
    } catch (error) {
      console.error("[v0] Search error:", error)
      // Handle error - could show error message to user
    } finally {
      setIsLoading(false)
      setLoadingMessage("")
    }
  }

  const handleUpgradeToPremium = () => {
    console.log("[v0] Upgrade to premium clicked")
    // Handle premium upgrade flow
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay with fade animation */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Search container with morphing animation */}
      <div
        className={`relative w-full max-w-6xl mx-4 transition-all duration-700 ease-out max-h-[90vh] overflow-y-auto ${
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-8"
        }`}
      >
        <div className="bg-background rounded-2xl shadow-2xl border p-8 md:p-12">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Find Your Healthcare Provider</h2>
            <p className="text-muted-foreground">
              Search our database of 825K+ providers and 4.5M+ prescription records
            </p>
          </div>

          {/* Main search inputs */}
          <div className="space-y-6 mb-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
              <Input
                ref={searchInputRef}
                placeholder="Enter medication name (e.g., Metformin, Lisinopril, Adderall)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-16 text-lg transition-all duration-300 focus:ring-2 focus:ring-accent/20 hover:border-accent/50 border-2"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
              <Input
                placeholder="Enter your location (city, state, or ZIP code)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-12 h-16 text-lg transition-all duration-300 focus:ring-2 focus:ring-accent/20 hover:border-accent/50 border-2"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <Button
              size="lg"
              className="w-full h-16 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] group"
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim() || !location.trim()}
            >
              <Search className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
              {isLoading ? loadingMessage : "Search Providers"}
            </Button>
          </div>

          {/* Search Results */}
          {showResults && (
            <div className="border-t pt-8">
              <SearchResults
                results={searchResults}
                isLoading={isLoading}
                loadingMessage={loadingMessage}
                onUpgradeToPremium={handleUpgradeToPremium}
              />
            </div>
          )}

          {/* Popular medications - only show when not showing results */}
          {!showResults && (
            <>
              <div className="mb-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Popular Medications</h3>
                <div className="flex flex-wrap gap-2">
                  {popularMedications.map((med) => (
                    <Badge
                      key={med}
                      variant="secondary"
                      className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setSearchQuery(med)}
                    >
                      {med}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Search tips */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Search Tips</h3>
                {searchTips.map(({ icon: Icon, text }, index) => (
                  <div key={index} className="flex items-start space-x-3 text-sm text-muted-foreground">
                    <Icon className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

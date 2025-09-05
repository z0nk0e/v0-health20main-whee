"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, X, Lightbulb, TrendingUp, Clock, Plus, Minus } from "lucide-react"
import { RxPrescribersAPI, type SearchResponse } from "@/lib/api"
import { SearchResults } from "@/components/search-results"

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
  initialLocation?: string
}

export function SearchOverlay({ isOpen, onClose, initialQuery = "", initialLocation = "" }: SearchOverlayProps) {
  const [medications, setMedications] = useState<string[]>(initialQuery ? [initialQuery] : [""])
  const [location, setLocation] = useState(initialLocation)
  const [searchRadius, setSearchRadius] = useState(25)
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
    "Alprazolam",
    "Metformin",
    "Aspirin",
    "Lisinopril",
    "Atorvastatin",
    "Levothyroxine",
    "Amlodipine",
    "Metoprolol",
  ]

  const searchTips = [
    { icon: Lightbulb, text: "Add multiple medications to find providers who prescribe all of them" },
    { icon: TrendingUp, text: "Popular searches: Alprazolam, Metformin, Aspirin combinations" },
    { icon: Clock, text: "Adjust search radius to find providers in different geographic areas" },
  ]

  const availableRadii = [10, 25, 50, 100];

  const addMedication = () => {
    if (medications.length < 5) {
      setMedications([...medications, ""])
    }
  }

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const updateMedication = (index: number, value: string) => {
    const newMedications = [...medications]
    newMedications[index] = value
    setMedications(newMedications)
  }

  const handleSearch = async () => {
    const validMedications = medications.filter((med) => med.trim())
    if (validMedications.length === 0 || !location.trim()) {
      return
    }

    setIsLoading(true)
    setShowResults(true)

    try {
      console.log("[v0] Starting multi-medication search:", {
        medications: validMedications,
        location,
        radius: searchRadius,
      })

      setLoadingMessage(`Finding providers of ${validMedications.join(", ")}...`)
      await new Promise((resolve) => setTimeout(resolve, 800))

      setLoadingMessage("Narrowing down to state...")
      await new Promise((resolve) => setTimeout(resolve, 600))

      setLoadingMessage(`Filtering for ${searchRadius} mile radius...`)
      await new Promise((resolve) => setTimeout(resolve, 500))

      setLoadingMessage("Cross-referencing multiple medications...")
      await new Promise((resolve) => setTimeout(resolve, 800))

      setLoadingMessage("Finalizing results...")
      await new Promise((resolve) => setTimeout(resolve, 600))

      // Mock lat/lng for now
      const lat = 40.7128
      const lng = -74.006

      const results = await RxPrescribersAPI.searchPrescribersHealf({
        pharmaName: validMedications.join(','),
        lat,
        lng,
        radius: searchRadius,
      })

      console.log("[v0] Multi-medication search results:", results)
      setSearchResults(results)
    } catch (error) {
      console.error("[v0] Search error:", error)
    } finally {
      setIsLoading(false)
      setLoadingMessage("")
    }
  }

  const handleUpgradeToPremium = () => {
    console.log("[v0] Upgrade to premium clicked")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-6xl mx-4 transition-all duration-700 ease-out max-h-[90vh] overflow-y-auto ${
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-8"
        }`}
      >
        <div className="bg-background rounded-2xl shadow-2xl border p-8 md:p-12">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Find Your Healthcare Provider</h2>
            <p className="text-muted-foreground">
              Search our database of 825K+ providers across different geographic areas
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Medications</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addMedication}
                  disabled={medications.length >= 5}
                  className="text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Medication
                </Button>
              </div>

              {medications.map((medication, index) => (
                <div key={index} className="relative group flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      ref={index === 0 ? searchInputRef : null}
                      placeholder={`Enter medication ${index + 1} (e.g., Alprazolam, Metformin, Aspirin)`}
                      value={medication}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMedication(index, e.target.value)}
                      className="pl-12 h-14 text-lg transition-all duration-300 focus:ring-2 focus:ring-primary/20 hover:border-primary/50 border-2"
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  {medications.length > 1 && (
                    <Button variant="outline" size="sm" onClick={() => removeMedication(index)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location & Search Area</h3>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Enter your location (city, state, or ZIP code)"
                  value={location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
                  className="pl-12 h-14 text-lg transition-all duration-300 focus:ring-2 focus:ring-primary/20 hover:border-primary/50 border-2"
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Search Radius:</label>
                <div className="flex space-x-2">
                  {availableRadii.map((radius: number) => (
                    <Button
                      key={radius}
                      variant={searchRadius === radius ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSearchRadius(radius)}
                      className="text-sm"
                    >
                      {radius} miles
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-16 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] group"
              onClick={handleSearch}
              disabled={isLoading || medications.every((med) => !med.trim()) || !location.trim()}
            >
              <Search className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
              {isLoading ? loadingMessage : "Search Providers"}
            </Button>
          </div>

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

          {!showResults && (
            <>
              <div className="mb-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Popular Medications</h3>
                <div className="flex flex-wrap gap-2">
                  {popularMedications.map((med) => (
                    <Badge
                      key={med}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => {
                        const emptyIndex = medications.findIndex((m) => !m.trim())
                        if (emptyIndex !== -1) {
                          updateMedication(emptyIndex, med)
                        } else if (medications.length < 5) {
                          setMedications([...medications, med])
                        }
                      }}
                    >
                      {med}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Search Tips</h3>
                {searchTips.map(({ icon: Icon, text }, index) => (
                  <div key={index} className="flex items-start space-x-3 text-sm text-muted-foreground">
                    <Icon className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
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
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchInterfaceProps {
  onSearch: (pharmaName: string, radius?: number) => void
  isSearching: boolean
  userLocation: { lat: number; lng: number } | null
}

interface DrugSuggestion {
  id: number
  name: string
  category: string | null
}

export function SearchInterface({ onSearch, isSearching, userLocation }: SearchInterfaceProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<DrugSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [radius, setRadius] = useState(25)

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.suggestions || [])
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error("[v0] Autocomplete error:", error)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim(), radius)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: DrugSuggestion) => {
    setQuery(suggestion.name)
    setShowSuggestions(false)
    onSearch(suggestion.name, radius)
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-4 items-end">
        {/* Search input with autocomplete */}
        <div className="flex-1 relative">
          <label htmlFor="pharma-search" className="block text-sm font-medium text-foreground mb-2">
            Pharmaceutical Name
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="pharma-search"
              type="text"
              placeholder="Search for Ozempic, Wegovy, Metformin..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-input/50 backdrop-blur-sm border-border/50 focus:ring-accent focus:border-accent"
              disabled={isSearching}
            />
          </div>

          {/* Autocomplete suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-accent/10 focus:bg-accent/10 focus:outline-none border-b border-border/20 last:border-b-0"
                >
                  <div className="font-medium text-foreground">{suggestion.name}</div>
                  {suggestion.category && <div className="text-sm text-muted-foreground">{suggestion.category}</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Radius selector */}
        <div>
          <label htmlFor="radius" className="block text-sm font-medium text-foreground mb-2">
            Search Radius
          </label>
          <select
            id="radius"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="px-3 py-2 bg-input border border-border rounded-md text-foreground focus:ring-accent focus:border-accent"
            disabled={isSearching}
          >
            <option value={10}>10 miles</option>
            <option value={25}>25 miles</option>
            <option value={50}>50 miles</option>
            <option value={100}>100 miles</option>
          </select>
        </div>

        {/* Search button */}
        <Button
          type="submit"
          disabled={isSearching || !query.trim() || !userLocation}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </form>

      {/* Location indicator */}
      {userLocation && (
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>
            Searching from: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  )
}

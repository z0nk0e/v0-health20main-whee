"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { SearchInterface } from "@/components/search-interface"
import { SonarMap } from "@/components/sonar-map"
import { PrescriberResults } from "@/components/prescriber-results"
import { MolecularBackground } from "@/components/molecular-background"
import type { PrescriberResult } from "@/lib/db/queries"

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <ExploreInner />
    </Suspense>
  )
}

function ExploreInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [searchResults, setSearchResults] = useState<PrescriberResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedPrescriber, setSelectedPrescriber] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [radius, setRadius] = useState<number>(25)
  const [searchCount, setSearchCount] = useState<number>(0)

  // Get user location on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          // Default to NYC if geolocation fails
          setUserLocation({ lat: 40.7128, lng: -74.006 })
        },
      )
    } else {
      setUserLocation({ lat: 40.7128, lng: -74.006 })
    }
  }, [])

  // Read URL params and hydrate state; trigger search if possible
  useEffect(() => {
    const q = params.get("q")
    const r = Number(params.get("r") || radius)
    if (q) {
      setSearchQuery(q)
      setRadius(isNaN(r) ? 25 : r)
      if (userLocation && !isSearching) {
        const t = setTimeout(() => handleSearch(q, isNaN(r) ? 25 : r), 100)
        return () => clearTimeout(t)
      }
    }
  }, [params, userLocation])

  const handleSearch = async (pharmaName: string, radiusMiles = 25) => {
    if (!userLocation || !pharmaName.trim()) return

    const url = new URL(window.location.href)
    url.searchParams.set("q", pharmaName)
    url.searchParams.set("r", String(radiusMiles))
    router.push(url.pathname + "?" + url.searchParams.toString(), { scroll: true })

    setIsSearching(true)
    setSearchQuery(pharmaName)
    setRadius(radiusMiles)

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmaName,
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: radiusMiles,
        }),
      })

      if (!response.ok) throw new Error("Search failed")

      const data = await response.json()
      setSearchResults(data.results || [])

      try {
        const nextCount = (Number(localStorage.getItem("rx_search_count") || 0) || 0) + 1
        localStorage.setItem("rx_search_count", String(nextCount))
        setSearchCount(nextCount)
        if ([3, 7, 15].includes(nextCount)) {
          toast.success(`Achievement unlocked: Explorer ${nextCount === 3 ? "I" : nextCount === 7 ? "II" : "III"}`, {
            description: `Great exploration! You’ve completed ${nextCount} searches.`,
          })
        }
      } catch {}
    } catch (error) {
      console.error("[v0] Search error:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const [plan, setPlan] = useState<string | null>(null)
  const [gate, setGate] = useState(false)

  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const res = await fetch('/api/me/access')
        if (res.ok) {
          const data = await res.json()
          setPlan(data.plan)
          setGate(data.plan === 'FREE')
        } else if (res.status === 401) {
          setGate(true)
        }
      } catch {}
    }
    fetchAccess()
  }, [])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <MolecularBackground />

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header with search */}
        <header className="p-6 border-b border-border/20 backdrop-blur-sm bg-background/80">
          {/* Thin progress bar for search activity */}
          {isSearching && <div className="h-0.5 w-full bg-gradient-to-r from-accent/40 via-accent to-accent/40 animate-pulse" />}
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground text-balance">Prescriber Search</h1>
                <p className="text-muted-foreground text-pretty">
                  Discover prescribers with a sonar-style experience
                </p>
              </div>
            </div>

            {!gate ? (
              <SearchInterface
                onSearch={handleSearch}
                isSearching={isSearching}
                userLocation={userLocation}
                defaultQuery={searchQuery}
                onQueryChange={setSearchQuery}
                upgradeChip={plan === 'FREE'}
              />
            ) : (
              <div className="border border-border rounded-md p-6 bg-card/50">
                <h2 className="text-xl font-semibold mb-2">Upgrade required</h2>
                <p className="text-muted-foreground mb-4">Sign in and upgrade to Basic, Premium, or Annual to access provider search.</p>
                <div className="flex gap-3">
                  <a href="/auth/signin" className="px-4 py-2 rounded bg-accent text-accent-foreground">Sign in</a>
                  <a href="/auth/signup" className="px-4 py-2 rounded border">Create account</a>
                  <a href="/for-providers" className="px-4 py-2 rounded border">Learn more</a>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main content area */}
        {!gate && (
          <div className="flex-1 flex">
            {/* Map area */}
            <div className="flex-1 relative">
              <SonarMap
                userLocation={userLocation}
                prescribers={searchResults}
                selectedPrescriber={selectedPrescriber}
                onPrescriberSelect={setSelectedPrescriber}
                isSearching={isSearching}
                searchQuery={searchQuery}
              />
            </div>

            {/* Results sidebar */}
            {searchResults.length > 0 && (
              <div className="w-96 border-l border-border/20 bg-card/50 backdrop-blur-sm">
                <PrescriberResults
                  results={searchResults}
                  selectedPrescriber={selectedPrescriber}
                  onPrescriberSelect={setSelectedPrescriber}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

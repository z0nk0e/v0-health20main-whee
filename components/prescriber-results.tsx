"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Globe, Star } from "lucide-react"
import type { PrescriberResult } from "@/lib/db/queries"

interface PrescriberResultsProps {
  results: PrescriberResult[]
  selectedPrescriber: string | null
  onPrescriberSelect: (npi: string) => void
}

export function PrescriberResults({ results, selectedPrescriber, onPrescriberSelect }: PrescriberResultsProps) {
  const getMatchColor = (score: number) => {
    if (score >= 80) return "bg-green-500/20 text-green-400 border-green-500/30"
    if (score >= 60) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }

  const getMatchLabel = (score: number) => {
    if (score >= 80) return "High Match"
    if (score >= 60) return "Good Match"
    return "Low Match"
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border/20">
        <h2 className="text-lg font-semibold text-foreground">Found {results.length} Prescribers</h2>
        <p className="text-sm text-muted-foreground">Sorted by distance and match score</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {results.map((prescriber) => (
          <Card
            key={prescriber.npi}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedPrescriber === prescriber.npi
                ? "ring-2 ring-accent shadow-lg"
                : "hover:ring-1 hover:ring-accent/50"
            }`}
            onClick={() => onPrescriberSelect(prescriber.npi)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-pretty">{prescriber.name}</h3>
                  {prescriber.specialty && <p className="text-sm text-muted-foreground">{prescriber.specialty}</p>}
                </div>
                <Badge className={`ml-2 ${getMatchColor(prescriber.matchScore)}`}>
                  {prescriber.matchScore}% {getMatchLabel(prescriber.matchScore)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  {prescriber.address.street && <div>{prescriber.address.street}</div>}
                  <div>
                    {prescriber.address.city}, {prescriber.address.state} {prescriber.address.zipCode}
                  </div>
                  <div className="text-xs text-accent">{prescriber.distance.toFixed(1)} miles away</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {prescriber.totalClaims.toLocaleString()} prescriptions
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Phone className="w-3 h-3 mr-1" />
                  Contact
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Globe className="w-3 h-3 mr-1" />
                  Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

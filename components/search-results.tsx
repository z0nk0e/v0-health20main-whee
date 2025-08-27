"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Lock, Zap, Eye } from "lucide-react"
import { PayPalButtons } from "@paypal/react-paypal-js"
import type { Prescriber, SearchResponse } from "@/lib/api"

interface SearchResultsProps {
  results: SearchResponse | null
  isLoading: boolean
  loadingMessage?: string
  onUpgradeToPremium: () => void
}

const PayPalButtonsComponent = ({
  onSuccess,
  onError,
  onCancel,
}: {
  onSuccess: () => void
  onError: () => void
  onCancel: () => void
}) => {
  const [isProcessing, setIsProcessing] = useState(false)

  const createOrder = useCallback(async () => {
    setIsProcessing(true)
    console.log("[v0] Creating PayPal order...")

    try {
      const response = await fetch("/api/paypal/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ name: "RX Prescribers Premium", price: 9.99, qty: 1 }],
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] PayPal order created:", data.id)
      return data.id
    } catch (error) {
      console.error("[v0] PayPal order creation failed:", error)
      setIsProcessing(false)
      throw error
    }
  }, [])

  const onApprove = useCallback(
    async (data: any) => {
      console.log("[v0] PayPal payment approved, capturing...")

      try {
        const response = await fetch(`/api/paypal/orders/${data.orderID}/capture`, {
          method: "POST",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const details = await response.json()
        console.log("[v0] PayPal payment captured:", details)

        setIsProcessing(false)
        onSuccess()
      } catch (error) {
        console.error("[v0] PayPal capture failed:", error)
        setIsProcessing(false)
        onError()
      }
    },
    [onSuccess, onError],
  )

  const handleError = useCallback(
    (err: any) => {
      console.error("[v0] PayPal error:", err)
      setIsProcessing(false)
      onError()
    },
    [onError],
  )

  const handleCancel = useCallback(() => {
    console.log("[v0] PayPal payment cancelled")
    setIsProcessing(false)
    onCancel()
  }, [onCancel])

  return (
    <PayPalButtons
      style={{
        layout: "vertical",
        color: "blue",
        shape: "rect",
        label: "paypal",
        height: 45,
      }}
      disabled={isProcessing}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={handleError}
      onCancel={handleCancel}
    />
  )
}

export function SearchResults({ results, isLoading, loadingMessage, onUpgradeToPremium }: SearchResultsProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const handleUpgradeClick = useCallback(() => {
    setShowUpgradeModal(true)
    onUpgradeToPremium()
  }, [onUpgradeToPremium])

  const PayPalUpgradeModal = useMemo(() => {
    if (!showUpgradeModal) return null

    const handleSuccess = () => {
      setShowUpgradeModal(false)
      alert("Payment successful! You now have premium access.")
      window.location.reload()
    }

    const handleError = () => {
      alert("Payment processing failed. Please try again.")
    }

    const handleCancel = () => {
      // Modal stays open on cancel
    }

    const handleClose = () => {
      setShowUpgradeModal(false)
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md relative">
          <CardHeader>
            <CardTitle className="text-center">Upgrade to Premium</CardTitle>
            <p className="text-center text-muted-foreground">
              Get full access to provider contact details and prescription history
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold">$9.99</p>
              <p className="text-sm text-muted-foreground">One-time payment</p>
            </div>

            <div className="w-full min-h-[120px] flex items-center justify-center">
              <div className="w-full max-w-[300px]">
                <PayPalButtonsComponent onSuccess={handleSuccess} onError={handleError} onCancel={handleCancel} />
              </div>
            </div>

            <Button variant="outline" onClick={handleClose} className="w-full bg-transparent">
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }, [showUpgradeModal])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">{loadingMessage || "Searching our database of 825K+ providers..."}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-auto max-w-2xl">
          <p className="text-sm text-blue-800 text-center">
            <strong>Did you know?</strong> Each prescriber's prescribing history is vetted and given a score for how
            much experience the prescriber has with your medication, known as % Match
          </p>
        </div>
      </div>
    )
  }

  if (!results) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Search Results</h2>
          <p className="text-muted-foreground">
            Found {results.results_count} providers in {results.search_location.city}, {results.search_location.state}{" "}
            {results.search_location.zip}
          </p>
        </div>

        {!results.is_premium && (
          <Button
            onClick={handleUpgradeClick}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        )}
      </div>

      {!results.is_premium && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-purple-900">Unlock Full Provider Details</h3>
                  <p className="text-sm text-purple-700">
                    Get complete contact information, specialties, and prescription history
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUpgradeClick}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-100 bg-transparent"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Full Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {results.prescribers.map((prescriber) => (
          <PrescriberCard
            key={prescriber.npi}
            prescriber={prescriber}
            isPremium={results.is_premium}
            onUpgrade={handleUpgradeClick}
          />
        ))}
      </div>

      {PayPalUpgradeModal}
    </div>
  )
}

interface PrescriberCardProps {
  prescriber: Prescriber
  isPremium: boolean
  onUpgrade: () => void
}

function PrescriberCard({ prescriber, isPremium, onUpgrade }: PrescriberCardProps) {
  const getMatchPercentage = (claims: number): number => {
    if (claims < 10) return 25
    if (claims < 20) return 50
    if (claims < 50) return 75
    return 100
  }

  const matchPercentage = getMatchPercentage(prescriber.total_claims)

  const BlurredText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    if (isPremium) {
      return <span className={className}>{children}</span>
    }

    return (
      <span className={`${className} relative`}>
        <span className="blur-sm select-none">{children}</span>
        <Lock className="absolute inset-0 w-3 h-3 text-muted-foreground m-auto" />
      </span>
    )
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${!isPremium ? "relative" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {isPremium ? prescriber.name : <BlurredText>{prescriber.name}</BlurredText>}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{prescriber.specialty}</p>
          </div>

          <div className="text-right space-y-1">
            <Badge variant="secondary" className="text-xs">
              {prescriber.address.city} • {prescriber.distance_miles} miles
            </Badge>
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  matchPercentage >= 75 ? "bg-green-500" : matchPercentage >= 50 ? "bg-yellow-500" : "bg-red-500"
                }`}
              ></div>
              <p className="text-xs text-green-600 font-medium">{matchPercentage}% Match</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            {isPremium ? (
              <>
                <p>{prescriber.address.street}</p>
                <p>
                  {prescriber.address.city}, {prescriber.address.state} {prescriber.address.zip}
                </p>
              </>
            ) : (
              <BlurredText>
                <p>{prescriber.address.street}</p>
                <p>
                  {prescriber.address.city}, {prescriber.address.state} {prescriber.address.zip}
                </p>
              </BlurredText>
            )}
          </div>
        </div>

        {prescriber.phone && (
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <BlurredText className="text-sm">{prescriber.phone}</BlurredText>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Prescription Information</h4>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Brand Name:</span> {prescriber.drug.brand_name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Therapeutic Class:</span> {prescriber.drug.therapeutic_class}
            </p>
            {prescriber.drug.controlled_substance && (
              <Badge variant="destructive" className="text-xs">
                Controlled Substance
              </Badge>
            )}
          </div>
        </div>

        {!isPremium && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <Button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              Unlock Full Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

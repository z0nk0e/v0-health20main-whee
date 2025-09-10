"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Star, Crown, Zap, ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"

interface SubscriptionTier {
  id: string
  name: string
  price: number
  interval: string
  features: string[]
  popular?: boolean
  icon: React.ReactNode
}

interface CurrentSubscription {
  status: "FREE" | "VERIFIED" | "FEATURED"
  expires?: string
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "forever",
    icon: <Star className="w-6 h-6" />,
    features: [
      "Basic listing in search results",
      "Standard profile page",
      "Contact information display",
      "Basic analytics",
    ],
  },
  {
    id: "verified",
    name: "Verified",
    price: 19,
    interval: "month",
    popular: true,
    icon: <Check className="w-6 h-6" />,
    features: [
      "Blue verified checkmark",
      "Priority in search results",
      "Enhanced profile with bio",
      "Detailed analytics dashboard",
      "Patient inquiry notifications",
      "Profile completeness insights",
    ],
  },
  {
    id: "featured",
    name: "Featured",
    price: 49,
    interval: "month",
    icon: <Crown className="w-6 h-6" />,
    features: [
      "Top placement in search results",
      "Featured badge and highlighting",
      "Premium profile customization",
      "Advanced analytics & insights",
      "Direct patient messaging",
      "Priority customer support",
      "Custom practice branding",
    ],
  },
]

export default function SubscriptionPage() {
  const { data: session } = useSession()
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription>({ status: "FREE" })
  const [isLoading, setIsLoading] = useState(true)
  const [processingTier, setProcessingTier] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch("/api/prescriber/subscription")
        if (response.ok) {
          const data = await response.json()
          setCurrentSubscription(data.subscription)
        }
      } catch (error) {
        console.error("[v0] Error fetching subscription:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchSubscription()
    }
  }, [session])

  const handleSubscribe = async (tierId: string) => {
    if (tierId === "free") return

    setProcessingTier(tierId)

    try {
      const response = await fetch("/api/prescriber/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to PayPal checkout
        window.location.href = data.approvalUrl
      } else {
        const errorData = await response.json()
        console.error("[v0] Subscription error:", errorData.error)
      }
    } catch (error) {
      console.error("[v0] Subscription error:", error)
    } finally {
      setProcessingTier(null)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch("/api/prescriber/subscription/cancel", {
        method: "POST",
      })

      if (response.ok) {
        setCurrentSubscription({ status: "FREE" })
      }
    } catch (error) {
      console.error("[v0] Cancel subscription error:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/prescriber/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Subscription Plans</h1>
              <p className="text-muted-foreground">Choose the plan that works best for your practice</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Current Subscription Status */}
        {currentSubscription.status !== "FREE" && (
          <Alert className="mb-8">
            <Zap className="h-4 w-4" />
            <AlertDescription>
              You are currently on the <strong>{currentSubscription.status}</strong> plan.
              {currentSubscription.expires && (
                <span> Your subscription expires on {new Date(currentSubscription.expires).toLocaleDateString()}.</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subscriptionTiers.map((tier) => {
            const isCurrentTier = tier.id.toUpperCase() === currentSubscription.status
            const isUpgrade = tier.id !== "free" && currentSubscription.status === "FREE"
            const isDowngrade =
              (tier.id === "verified" && currentSubscription.status === "FEATURED") ||
              (tier.id === "free" && currentSubscription.status !== "FREE")

            return (
              <Card
                key={tier.id}
                className={`relative ${
                  tier.popular ? "ring-2 ring-accent shadow-lg scale-105" : ""
                } ${isCurrentTier ? "border-green-500/50 bg-green-500/5" : ""}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground">Most Popular</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${tier.popular ? "bg-accent/20" : "bg-muted/50"}`}>
                      {tier.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="text-3xl font-bold text-foreground">
                    ${tier.price}
                    {tier.price > 0 && (
                      <span className="text-sm font-normal text-muted-foreground">/{tier.interval}</span>
                    )}
                  </div>
                  <CardDescription>
                    {tier.id === "free" && "Perfect for getting started"}
                    {tier.id === "verified" && "Great for established practices"}
                    {tier.id === "featured" && "Maximum visibility and features"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4">
                    {isCurrentTier ? (
                      <div className="space-y-2">
                        <Button disabled className="w-full">
                          Current Plan
                        </Button>
                        {tier.id !== "free" && (
                          <Button
                            variant="outline"
                            onClick={handleCancelSubscription}
                            className="w-full bg-transparent"
                          >
                            Cancel Subscription
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe(tier.id)}
                        disabled={processingTier === tier.id}
                        className={`w-full ${
                          tier.popular ? "bg-accent hover:bg-accent/90" : ""
                        } ${isDowngrade ? "opacity-50" : ""}`}
                        variant={tier.popular ? "default" : "outline"}
                      >
                        {processingTier === tier.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            {tier.id === "free" ? "Downgrade" : isUpgrade ? "Upgrade" : "Switch Plan"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing
                  is prorated.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major credit cards, debit cards, and PayPal through our secure payment processor.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a contract or commitment?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No, all plans are month-to-month with no long-term commitment. You can cancel anytime.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does the verification process work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Verified and Featured plans include identity verification through NPI number validation and medical
                  license confirmation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

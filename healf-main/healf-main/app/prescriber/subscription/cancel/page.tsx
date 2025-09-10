"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SubscriptionCancel() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-foreground">Subscription Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your subscription process was cancelled. No charges have been made to your account.
          </p>

          <div className="space-y-2">
            <Link href="/prescriber/subscription">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Subscription Plans
              </Button>
            </Link>
            <Link href="/prescriber/dashboard">
              <Button variant="outline" className="w-full bg-transparent">
                Go to Dashboard
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            You can try subscribing again at any time from your dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

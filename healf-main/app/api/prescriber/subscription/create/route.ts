import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"

const createSubscriptionSchema = z.object({
  tierId: z.enum(["verified", "featured"]),
})

// PayPal API configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_PLAN_VERIFIED_ID = process.env.PAYPAL_PLAN_VERIFIED_ID
const PAYPAL_PLAN_FEATURED_ID = process.env.PAYPAL_PLAN_FEATURED_ID
const PAYPAL_BASE_URL =
  process.env.NODE_ENV === "production" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com"

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "PRESCRIBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return NextResponse.json({ error: "PayPal credentials not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { tierId } = createSubscriptionSchema.parse(body)

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Define subscription plans (prefer env-configured plan IDs)
    const plans = {
      verified: {
        planId: PAYPAL_PLAN_VERIFIED_ID || "P-VERIFIED-PLAN-ID",
        amount: "19.00",
        name: "PharmaConnect Verified",
      },
      featured: {
        planId: PAYPAL_PLAN_FEATURED_ID || "P-FEATURED-PLAN-ID",
        amount: "49.00",
        name: "PharmaConnect Featured",
      },
    }

    const selectedPlan = plans[tierId]

    // Guard: if placeholder plan IDs are still present, instruct configuration
    if (
      (tierId === "verified" && selectedPlan.planId === "P-VERIFIED-PLAN-ID") ||
      (tierId === "featured" && selectedPlan.planId === "P-FEATURED-PLAN-ID")
    ) {
      return NextResponse.json(
        { error: `PayPal ${tierId} plan ID not configured. Set PAYPAL_PLAN_${tierId.toUpperCase()}_ID in environment.` },
        { status: 500 },
      )
    }

    // Create PayPal subscription
    const subscriptionData = {
      plan_id: selectedPlan.planId,
      subscriber: {
        email_address: session.user.email,
      },
      application_context: {
        brand_name: "PharmaConnect",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
        },
        return_url: `${process.env.NEXTAUTH_URL}/prescriber/subscription/success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/prescriber/subscription/cancel`,
      },
      custom_id: session.user.id, // Store user ID for webhook processing
    }

    const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(subscriptionData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] PayPal subscription error:", errorData)
      return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
    }

    const subscription = await response.json()

    // Find the approval URL
    const approvalUrl = subscription.links.find((link: any) => link.rel === "approve")?.href

    if (!approvalUrl) {
      return NextResponse.json({ error: "No approval URL found" }, { status: 500 })
    }

    console.log("[v0] PayPal subscription created:", subscription.id)

    return NextResponse.json({
      subscriptionId: subscription.id,
      approvalUrl,
    })
  } catch (error) {
    console.error("[v0] Create subscription error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

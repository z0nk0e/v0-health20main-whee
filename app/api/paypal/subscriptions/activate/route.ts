import { NextResponse } from "next/server"

const PAYPAL_BASE_URL = process.env.PAYPAL_ENV === "live" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com"

async function getAccessToken() {
  const id = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!id || !secret) throw new Error("PayPal credentials not configured")
  const auth = Buffer.from(`${id}:${secret}`).toString("base64")
  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  })
  if (!res.ok) throw new Error(`PayPal token error: ${res.status}`)
  return (await res.json()).access_token as string
}

export async function POST(request: Request) {
  try {
    const { subscriptionId } = await request.json()
    if (!subscriptionId) return NextResponse.json({ error: "subscriptionId required" }, { status: 400 })

    const token = await getAccessToken()
    const res = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 })
    }
    const sub = await res.json()
    const planId = sub.plan_id as string

    // Extract userId from custom_id if present
    const customId = sub.custom_id as string | undefined
    let userId: string | undefined
    if (customId && customId.includes(":")) {
      userId = customId.split(":")[0]
    }

    const basicId = process.env.PAYPAL_PLAN_BASIC_ID
    const premiumId = process.env.PAYPAL_PLAN_PREMIUM_ID
    const annualId = process.env.PAYPAL_PLAN_ANNUAL_ID

    if (!userId) {
      // If we don't have custom_id, return info for client to follow-up with user binding
      return NextResponse.json({ ok: true, note: "No userId bound to subscription", planId, subscription: sub })
    }

    const { updateUserPlan } = await import("@/lib/db/access")
    if (planId === basicId) await updateUserPlan(userId, "BASIC", 30)
    else if (planId === premiumId) await updateUserPlan(userId, "PREMIUM", 30)
    else if (planId === annualId) await updateUserPlan(userId, "ANNUAL", 365)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[paypal] activate subscription error", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

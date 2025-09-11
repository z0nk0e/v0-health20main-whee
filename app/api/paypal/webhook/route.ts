import { NextResponse, type NextRequest } from "next/server"
import { getDb } from "@/lib/db/connection"
import { prescriberProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID
const PAYPAL_BASE_URL = process.env.PAYPAL_ENV === "live" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com"

async function getAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials not configured")
  }
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")
  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })
  if (!res.ok) throw new Error(`PayPal token error: ${res.status}`)
  const data = await res.json()
  return data.access_token as string
}

async function verifyWebhookSignature(headers: Headers, rawBody: string): Promise<boolean> {
  if (!PAYPAL_WEBHOOK_ID) {
    console.error("[paypal] Missing PAYPAL_WEBHOOK_ID env var")
    return false
  }

  const transmissionId = headers.get("paypal-transmission-id")
  const transmissionTime = headers.get("paypal-transmission-time")
  const certUrl = headers.get("paypal-cert-url")
  const authAlgo = headers.get("paypal-auth-algo")
  const transmissionSig = headers.get("paypal-transmission-sig")

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    console.error("[paypal] Missing webhook signature headers")
    return false
  }

  const accessToken = await getAccessToken()
  const body = JSON.parse(rawBody)

  const verifyRes = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: body,
    }),
  })

  if (!verifyRes.ok) {
    console.error("[paypal] Webhook verify API error", verifyRes.status)
    return false
  }
  const verifyData = await verifyRes.json()
  return (verifyData.verification_status as string) === "SUCCESS"
}

async function handleSubscriptionActivated(resource: any) {
  const planId = resource?.plan_id as string | undefined
  // If this is a prescriber plan, update prescriberProfiles via custom_id
  if (planId && (planId === process.env.PAYPAL_PLAN_VERIFIED_ID || planId === process.env.PAYPAL_PLAN_FEATURED_ID)) {
    const userId = resource?.custom_id
    if (!userId) return
    const db = getDb()
    const status = planId === process.env.PAYPAL_PLAN_FEATURED_ID ? "FEATURED" : "VERIFIED"
    const expires = new Date(); expires.setMonth(expires.getMonth() + 1)
    await db.update(prescriberProfiles)
      .set({ subscriptionStatus: status as any, subscriptionExpires: expires, verified: true })
      .where(eq(prescriberProfiles.userId, userId))
    return
  }
  // Else treat as patient plan: update user_access
  const { updateUserPlan } = await import("@/lib/db/access")
  const userIdFromCustom = resource?.custom_id as string | undefined
  const basicId = process.env.PAYPAL_PLAN_BASIC_ID
  const premiumId = process.env.PAYPAL_PLAN_PREMIUM_ID
  const annualId = process.env.PAYPAL_PLAN_ANNUAL_ID
  if (!planId) return
  if (!userIdFromCustom) return // for client-created subscriptions custom_id may be missing; rely on manual activation endpoint
  if (planId === basicId) await updateUserPlan(userIdFromCustom, "BASIC", 30)
  else if (planId === premiumId) await updateUserPlan(userIdFromCustom, "PREMIUM", 30)
  else if (planId === annualId) await updateUserPlan(userIdFromCustom, "ANNUAL", 365)
}

async function handleSubscriptionCancelled(resource: any) {
  const planId = resource?.plan_id as string | undefined
  const userId = resource?.custom_id as string | undefined
  if (!userId) return
  const db = getDb()
  if (planId && (planId === process.env.PAYPAL_PLAN_VERIFIED_ID || planId === process.env.PAYPAL_PLAN_FEATURED_ID)) {
    await db.update(prescriberProfiles)
      .set({ subscriptionStatus: "FREE", subscriptionExpires: null, verified: false })
      .where(eq(prescriberProfiles.userId, userId))
    return
  }
  const { updateUserPlan } = await import("@/lib/db/access")
  await updateUserPlan(userId, "FREE")
}

async function handleSubscriptionSuspended(resource: any) {
  const planId = resource?.plan_id as string | undefined
  const userId = resource?.custom_id as string | undefined
  if (!userId) return
  const db = getDb()
  if (planId && (planId === process.env.PAYPAL_PLAN_VERIFIED_ID || planId === process.env.PAYPAL_PLAN_FEATURED_ID)) {
    await db.update(prescriberProfiles)
      .set({ subscriptionExpires: new Date(), verified: false })
      .where(eq(prescriberProfiles.userId, userId))
    return
  }
  const { updateUserPlan } = await import("@/lib/db/access")
  await updateUserPlan(userId, "FREE")
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const valid = await verifyWebhookSignature(request.headers, rawBody)
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(rawBody)
    const eventType = event?.event_type as string
    const resource = event?.resource

    console.log("[paypal] Webhook:", eventType)

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED":
      case "CHECKOUT.ORDER.APPROVED":
        // One-time purchase events; log for now
        break
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleSubscriptionActivated(resource)
        break
      case "BILLING.SUBSCRIPTION.CANCELLED":
        await handleSubscriptionCancelled(resource)
        break
      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await handleSubscriptionSuspended(resource)
        break
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
        // Consider notifying user/admin
        break
      default:
        // other events ignored
        break
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[paypal] Webhook handler error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

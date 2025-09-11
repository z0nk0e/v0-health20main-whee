import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getDb } from "@/lib/db/connection"
import { userAccess } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

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

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 })

    const db = getDb()
    const rows = await db.select().from(userAccess).where(eq(userAccess.userId, userId))
    const access = rows[0]
    if (!access?.subscriptionId) return NextResponse.json({ error: "No subscription" }, { status: 404 })

    const token = await getAccessToken()
    const res = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${access.subscriptionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
    const sub = await res.json()

    return NextResponse.json({
      id: sub.id,
      status: sub.status,
      planId: sub.plan_id,
      startTime: sub.start_time,
      nextBillingTime: sub.billing_info?.next_billing_time,
      lastPayment: sub.billing_info?.last_payment,
    })
  } catch (e) {
    console.error("[me/subscription/status] error", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

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

export async function POST() {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 })

    const db = getDb()
    const rows = await db.select().from(userAccess).where(eq(userAccess.userId, userId))
    const access = rows[0]
    if (!access || !access.subscriptionId) {
      return NextResponse.json({ error: "No active subscription" }, { status: 400 })
    }

    const token = await getAccessToken()
    const res = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${access.subscriptionId}/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "User requested cancellation" }),
    })
    if (!res.ok) {
      const txt = await res.text()
      return NextResponse.json({ error: `Cancel failed: ${res.status}`, details: txt }, { status: 500 })
    }

    // Set plan to FREE immediately
    await db
      .update(userAccess)
      .set({ plan: "FREE", expiresAt: null, subscriptionId: null, updatedAt: new Date() })
      .where(eq(userAccess.userId, userId))

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[subscription] cancel error", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

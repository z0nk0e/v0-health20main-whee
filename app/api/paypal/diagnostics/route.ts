import { NextResponse } from "next/server"

const PAYPAL_BASE_URL = process.env.PAYPAL_ENV === "live" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com"

export async function GET() {
  try {
    const id = process.env.PAYPAL_CLIENT_ID
    const secret = process.env.PAYPAL_CLIENT_SECRET
    const env = process.env.PAYPAL_ENV || "sandbox"

    const hasId = Boolean(id)
    const hasSecret = Boolean(secret)

    let tokenOk = false
    let tokenStatus: number | null = null
    let tokenError: string | null = null

    if (hasId && hasSecret) {
      const auth = Buffer.from(`${id}:${secret}`).toString("base64")
      const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials",
        cache: "no-store",
      })
      tokenStatus = res.status
      if (res.ok) tokenOk = true
      else tokenError = await res.text()
    }

    return NextResponse.json({
      env,
      hasClientId: hasId,
      hasClientSecret: hasSecret,
      tokenOk,
      tokenStatus,
      tokenError,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}

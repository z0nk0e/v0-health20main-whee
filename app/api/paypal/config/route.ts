import { NextResponse } from "next/server"

export async function GET() {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID || null
    const env = process.env.PAYPAL_ENV || "sandbox"
    const basicId = process.env.PAYPAL_PLAN_BASIC_ID || null
    const premiumId = process.env.PAYPAL_PLAN_PREMIUM_ID || null
    const annualId = process.env.PAYPAL_PLAN_ANNUAL_ID || null

    return NextResponse.json({
      env,
      clientId,
      plans: {
        basicId,
        premiumId,
        annualId,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}

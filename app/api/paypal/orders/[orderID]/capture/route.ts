import { NextResponse } from "next/server"

// Dynamic import for PayPal SDK
async function getPayPalClient() {
  const paypal = await import("@paypal/checkout-server-sdk")

  const environment =
    process.env.PAYPAL_ENV === "live"
      ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!)
      : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!)

  return new paypal.core.PayPalHttpClient(environment)
}

export async function POST(request: Request, context: { params: Promise<{ orderID: string }> }) {
  try {
    const { orderID } = await context.params

    const paypal = await import("@paypal/checkout-server-sdk")
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID)
    captureRequest.requestBody({})

    const client = await getPayPalClient()
    const capture = await client.execute(captureRequest)

    console.log("[v0] PayPal payment captured:", capture.result)

    // Update user entitlements based on custom_id and planType
    try {
      const unit = capture.result?.purchase_units?.[0] as any
      const custom = (unit?.custom_id as string) || ""
      const [userId, planType] = custom.split(":")
      if (userId) {
        const { updateUserPlan } = await import("@/lib/db/access")
        if (planType === "basic") {
          await updateUserPlan(userId, "BASIC", 30)
        } else if (planType === "premium") {
          await updateUserPlan(userId, "PREMIUM", 30)
        } else if (planType === "annual") {
          await updateUserPlan(userId, "ANNUAL", 365)
        }
      }
    } catch (e) {
      console.error("[v0] Failed to update user plan from capture:", e)
    }

    return NextResponse.json(capture.result)
  } catch (error) {
    console.error("[v0] PayPal capture failed:", error)
    return NextResponse.json({ error: "Capture failed" }, { status: 500 })
  }
}

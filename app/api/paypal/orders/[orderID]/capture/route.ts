import { type NextRequest, NextResponse } from "next/server"

// Dynamic import for PayPal SDK
async function getPayPalClient() {
  const paypal = await import("@paypal/checkout-server-sdk")

  const environment =
    process.env.PAYPAL_ENV === "live"
      ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!)
      : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!)

  return new paypal.core.PayPalHttpClient(environment)
}

export async function POST(request: NextRequest, { params }: { params: { orderID: string } }) {
  try {
    const { orderID } = params

    const paypal = await import("@paypal/checkout-server-sdk")
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID)
    captureRequest.requestBody({})

    const client = await getPayPalClient()
    const capture = await client.execute(captureRequest)

    console.log("[v0] PayPal payment captured:", capture.result)

    // Here you would typically:
    // 1. Store the transaction in your database
    // 2. Update user's premium status
    // 3. Send confirmation email

    return NextResponse.json(capture.result)
  } catch (error) {
    console.error("[v0] PayPal capture failed:", error)
    return NextResponse.json({ error: "Capture failed" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"

// PayPal SDK types (simplified)
interface PayPalEnvironment {
  new (clientId: string, clientSecret: string): any
}

interface PayPalHttpClient {
  new (environment: any): any
  execute(request: any): Promise<any>
}

interface PayPalCore {
  SandboxEnvironment: PayPalEnvironment
  LiveEnvironment: PayPalEnvironment
  PayPalHttpClient: PayPalHttpClient
}

interface PayPalOrders {
  OrdersCreateRequest: new () => any
}

// Dynamic import for PayPal SDK
async function getPayPalClient() {
  const paypal = await import("@paypal/checkout-server-sdk")

  const environment =
    process.env.PAYPAL_ENV === "live"
      ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!)
      : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!)

  return new paypal.core.PayPalHttpClient(environment)
}

export async function POST(request: NextRequest) {
  try {
    const { items = [], currency = "USD" } = await request.json()

    // Server-side calculation of total (secure)
    const total = items.length
      ? items.reduce((sum: number, item: any) => sum + Number(item.price) * Number(item.qty), 0)
      : 9.99 // Default premium price

    const paypal = await import("@paypal/checkout-server-sdk")
    const orderRequest = new paypal.orders.OrdersCreateRequest()

    orderRequest.prefer("return=representation")
    orderRequest.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: currency,
                value: total.toFixed(2),
              },
            },
          },
          description: "RxPrescribers Premium Access",
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment-success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment-cancelled`,
      },
    })

    const client = await getPayPalClient()
    const response = await client.execute(orderRequest)

    console.log("[v0] PayPal order created:", response.result.id)

    return NextResponse.json({ id: response.result.id })
  } catch (error) {
    console.error("[v0] PayPal order creation failed:", error)
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 })
  }
}

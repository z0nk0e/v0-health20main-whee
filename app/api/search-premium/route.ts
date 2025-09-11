import { type NextRequest, NextResponse } from "next/server"

import { requireAuth } from "@/lib/api/guard"
import { getOrCreateUserAccess } from "@/lib/db/access"

const API_BASE_URL = "https://api.rxprescribers.com"

export async function GET(request: NextRequest) {
  try {
    // Require auth and premium plan
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const { userId } = authResult

    const access = await getOrCreateUserAccess(userId)
    if (!(access.plan === "PREMIUM" || access.plan === "ANNUAL")) {
      return NextResponse.json({ error: "Premium required", reason: "premium_only" }, { status: 402 })
    }

    const { searchParams } = new URL(request.url)

    // Forward all query parameters to the external API
    const queryString = searchParams.toString()

    console.log("[v0] Proxying premium search request to:", `${API_BASE_URL}/api_premium.php?${queryString}`)

    const response = await fetch(`${API_BASE_URL}/api_premium.php?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const responseText = await response.text()
    console.log("[v0] Raw premium API response:", responseText.substring(0, 200) + "...")

    if (!response.ok) {
      console.error("[v0] External API error:", response.status, response.statusText, responseText)
      return NextResponse.json(
        {
          error: `External API error: ${responseText}`,
          status: response.status,
        },
        { status: response.status },
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (_e) {
      console.error("[v0] Failed to parse premium API response as JSON:", responseText)
      return NextResponse.json(
        {
          error: `Invalid API response: ${responseText}`,
          raw_response: responseText,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Premium search results received:", data.results_count || 0, "results")

    return NextResponse.json({
      ...data,
      is_premium: true, // Premium API returns full results
    })
  } catch (error) {
    console.error("[v0] API proxy error:", error)
    return NextResponse.json({ error: "Failed to search prescribers (premium)" }, { status: 500 })
  }
}

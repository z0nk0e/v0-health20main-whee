import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/guard"
import { getOrCreateUserAccess, canConsumeSearch } from "@/lib/db/access"

const API_BASE_URL = "https://api.rxprescribers.com"

export async function GET(request: NextRequest) {
  try {
    // Require auth
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const { userId } = authResult

    // Enforce plan entitlements (non-free + monthly limits if BASIC)
    const access = await getOrCreateUserAccess(userId)
    const gate = await canConsumeSearch(userId)
    if (!gate.allowed) {
      return NextResponse.json({ error: "Upgrade required", reason: gate.reason }, { status: 402 })
    }

    const { searchParams } = new URL(request.url)

    // Forward all query parameters to the external API
    const queryString = searchParams.toString()

    console.log("[v0] Proxying enhanced search request to:", `${API_BASE_URL}/api_enhanced_fixed.php?${queryString}`)

    const response = await fetch(`${API_BASE_URL}/api_enhanced_fixed.php?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const responseText = await response.text()
    console.log("[v0] Raw enhanced API response:", responseText.substring(0, 200) + "...")

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
      console.error("[v0] Failed to parse enhanced API response as JSON:", responseText)
      return NextResponse.json(
        {
          error: `Invalid API response: ${responseText}`,
          raw_response: responseText,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Enhanced search results received:", data.results_count || 0, "results")

    return NextResponse.json({
      ...data,
      is_premium: access.plan !== "FREE",
    })
  } catch (error) {
    console.error("[v0] API proxy error:", error)
    return NextResponse.json({ error: "Failed to search prescribers (enhanced)" }, { status: 500 })
  }
}

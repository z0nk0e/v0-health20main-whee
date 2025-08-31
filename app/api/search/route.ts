import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = "https://api.rxprescribers.com"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Forward all query parameters to the external API
    const queryString = searchParams.toString()

    console.log("[v0] Proxying search request to:", `${API_BASE_URL}/api.php?${queryString}`)

    const response = await fetch(`${API_BASE_URL}/api.php?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add any required headers for the external API
      },
    })

    const responseText = await response.text()
    console.log("[v0] Raw API response:", responseText.substring(0, 200) + "...")

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
    } catch (parseError) {
      console.error("[v0] Failed to parse API response as JSON:", responseText)
      return NextResponse.json(
        {
          error: `Invalid API response: ${responseText}`,
          raw_response: responseText,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Search results received:", data.results_count || 0, "results")

    return NextResponse.json({
      ...data,
      is_premium: false, // Free API always returns non-premium results
    })
  } catch (error) {
    console.error("[v0] API proxy error:", error)
    return NextResponse.json({ error: "Failed to search prescribers" }, { status: 500 })
  }
}

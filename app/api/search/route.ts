import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = "https://api.rxprescribers.com"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json(); // Parse the request body for POST data
    const { searchParams } = new URL(request.url); // Still need searchParams if they are appended to the URL

    // Construct the query string from the request body and URL search parameters
    // This assumes the external API can handle parameters from both sources.
    // Adjust this logic if the external API expects parameters in a specific way.
    const queryString = searchParams.toString();
    const bodyParams = new URLSearchParams(body).toString();
    const fullQueryString = queryString ? `${queryString}&${bodyParams}` : bodyParams;

    console.log("[v0] Proxying search request to:", `${API_BASE_URL}/api.php?${fullQueryString}`)

    const response = await fetch(`${API_BASE_URL}/api.php?${fullQueryString}`, {
      method: "POST", // Change method to POST
      headers: {
        "Content-Type": "application/json",
        // Add any required headers for the external API
      },
      body: JSON.stringify(body), // Send the parsed body to the external API
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
    // Consider if the error message should be more specific based on the type of error
    return NextResponse.json({ error: "Failed to search prescribers" }, { status: 500 })
  }
}
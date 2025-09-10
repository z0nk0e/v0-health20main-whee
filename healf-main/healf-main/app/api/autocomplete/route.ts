import { type NextRequest, NextResponse } from "next/server"
import { getDrugSuggestions } from "@/lib/db/queries"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  try {
    console.log("[v0] Autocomplete request:", {
      method: request.method,
      path: request.nextUrl.pathname,
      query,
    })

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = await getDrugSuggestions(query, 10)

    console.log("[v0] Autocomplete success:", {
      query,
      suggestionsCount: suggestions.length,
    })

    return NextResponse.json({
      suggestions: suggestions.map((drug) => ({
        id: drug.drugId,
        name: drug.brandName,
        category: drug.therapeuticClass,
      })),
    })
  } catch (error) {
    console.error("[v0] Autocomplete API error:", {
      query,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

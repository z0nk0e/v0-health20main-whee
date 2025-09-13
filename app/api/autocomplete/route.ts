import { type NextRequest, NextResponse } from "next/server"
import { getDrugSuggestions } from "@/lib/db/queries"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  try {
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = await getDrugSuggestions(query, 10)

    return NextResponse.json({
      suggestions: suggestions.map((drug) => ({
        id: drug.drugId,
        name: drug.brandName,
        category: drug.therapeuticClass,
      })),
    })
  } catch (error) {
    console.error("[autocomplete] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

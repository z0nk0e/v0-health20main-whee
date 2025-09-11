import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getOrCreateUserAccess } from "@/lib/db/access"

export async function GET() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 })
  }
  const access = await getOrCreateUserAccess(userId)
  return NextResponse.json({
    plan: access.plan,
    searchesUsed: access.searchesUsed ?? 0,
    monthStart: access.monthStart,
    expiresAt: access.expiresAt,
    subscriptionId: access.subscriptionId,
  })
}

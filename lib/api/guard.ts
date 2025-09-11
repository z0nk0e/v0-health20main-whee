import { NextResponse } from "next/server"
import { auth } from "@/auth"

/**
 * Ensures the caller is authenticated. Returns either a userId payload or a NextResponse(401).
 */
export async function requireAuth(): Promise<{ userId: string } | NextResponse> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 })
  }
  return { userId }
}

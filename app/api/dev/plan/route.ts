import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { updateUserPlan, type Plan } from "@/lib/db/access"

const ALLOWED = process.env.NODE_ENV === "development" || process.env.ALLOW_PLAN_CHANGE === "true"

export async function POST(request: Request) {
  try {
    if (!ALLOWED) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 })
    }
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 })

    const body = await request.json().catch(() => ({})) as { plan?: Plan; durationDays?: number }
    const plan = body.plan
    const durationDays = body.durationDays ?? (plan === "ANNUAL" ? 365 : 30)

    if (!plan || !["FREE", "BASIC", "PREMIUM", "ANNUAL"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    await updateUserPlan(userId, plan, plan === "FREE" ? undefined : durationDays)
    return NextResponse.json({ ok: true, plan })
  } catch (e) {
    console.error("[dev/plan] error", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

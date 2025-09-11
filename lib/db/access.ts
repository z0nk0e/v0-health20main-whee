import { getDb } from "./connection"
import { userAccess } from "./schema"
import { eq } from "drizzle-orm"

export type Plan = "FREE" | "BASIC" | "PREMIUM" | "ANNUAL"

export async function getOrCreateUserAccess(userId: string) {
  const db = getDb()
  const existing = await db.select().from(userAccess).where(eq(userAccess.userId, userId))
  if (existing.length > 0) return existing[0]
  await db.insert(userAccess).values({ userId, plan: "FREE", searchesUsed: 0, monthStart: new Date() })
  const created = await db.select().from(userAccess).where(eq(userAccess.userId, userId))
  return created[0]
}

export async function updateUserPlan(userId: string, plan: Plan, durationDays?: number, subscriptionId?: string) {
  const db = getDb()
  const expiresAt = durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null
  await db
    .insert(userAccess)
    .values({ userId, plan, searchesUsed: 0, monthStart: new Date(), expiresAt: expiresAt ?? undefined, subscriptionId })
    .onDuplicateKeyUpdate({
      set: { plan, searchesUsed: 0, monthStart: new Date(), expiresAt: expiresAt ?? null, subscriptionId: subscriptionId ?? null, updatedAt: new Date() },
    })
}

export async function canConsumeSearch(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const db = getDb()
  const accessRows = await db.select().from(userAccess).where(eq(userAccess.userId, userId))
  const access = accessRows[0]
  if (!access || access.plan === "FREE") return { allowed: false, reason: "upgrade_required" }
  if (access.expiresAt && new Date(access.expiresAt) < new Date()) {
    return { allowed: false, reason: "expired" }
  }
  if (access.plan === "BASIC") {
    const monthStart = access.monthStart ? new Date(access.monthStart) : new Date()
    const now = new Date()
    const isNewMonth = monthStart.getUTCFullYear() !== now.getUTCFullYear() || monthStart.getUTCMonth() !== now.getUTCMonth()
    const searchesUsed = isNewMonth ? 0 : access.searchesUsed ?? 0
    if (searchesUsed >= 5) return { allowed: false, reason: "limit_reached" }
  }
  return { allowed: true }
}

export async function consumeSearch(userId: string) {
  const db = getDb()
  const rows = await db.select().from(userAccess).where(eq(userAccess.userId, userId))
  const access = rows[0]
  if (!access) return
  const now = new Date()
  let searchesUsed = access.searchesUsed ?? 0
  let monthStart = access.monthStart ? new Date(access.monthStart) : now
  const isNewMonth = monthStart.getUTCFullYear() !== now.getUTCFullYear() || monthStart.getUTCMonth() !== now.getUTCMonth()
  if (isNewMonth) {
    searchesUsed = 0
    monthStart = now
  }
  await db
    .update(userAccess)
    .set({ searchesUsed: searchesUsed + 1, monthStart, updatedAt: new Date() })
    .where(eq(userAccess.userId, userId))
}

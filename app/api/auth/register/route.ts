import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { validateRegistration } = await import("@/lib/auth/validation")
    const validation = validateRegistration(body)
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const [{ getDb }, { users }, { eq }, { hashPassword }] = await Promise.all([
      import("@/lib/db/connection"),
      import("@/lib/db/schema"),
      import("drizzle-orm"),
      import("@/lib/auth/hash"),
    ])

    const { email, password, name, role } = validation.value

    const db = getDb()

    // Check uniqueness by email
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    await db.insert(users).values({
      email,
      passwordHash,
      name,
      role,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 })
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }
    console.error("[register] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

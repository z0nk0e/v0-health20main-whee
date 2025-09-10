import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { validateRegistration } = await import("@/lib/auth/validation")
    const validation = validateRegistration(body)
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { email, password, name, role } = validation.value

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.error("[register] Missing Supabase env vars")
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    })

    if (error) {
      const status = (error as any).status ?? 500
      if (status === 422 || status === 409) {
        return NextResponse.json({ error: "E-mail already in use" }, { status: 409 })
      }
      console.error("[register] supabase error:", error)
      return NextResponse.json({ error: "Unable to register" }, { status: 500 })
    }

    if (!data?.user) {
      return NextResponse.json({ error: "Registration failed" }, { status: 500 })
    }

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 })
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }
    console.error("[register] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

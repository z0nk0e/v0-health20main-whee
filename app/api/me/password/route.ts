import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const session = await auth()
    const user = session?.user
    if (!user?.email || !user?.id) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    // Verify current password using anon key
    const supabaseAnon = createClient(supabaseUrl, anonKey)
    const verify = await supabaseAnon.auth.signInWithPassword({ email: user.email, password: currentPassword })
    if (verify.error || !verify.data?.user) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 })
    }

    // Update password via admin
    const supabaseSvc = createClient(supabaseUrl, serviceKey)
    const upd = await supabaseSvc.auth.admin.updateUserById(user.id, { password: newPassword })
    if (upd.error) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[me/password] error", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

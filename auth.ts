import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { AuthConfig } from "@auth/core/types"
import { createClient } from "@supabase/supabase-js"

const config: AuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (!supabaseUrl || !supabaseKey) {
          console.error("[auth] Missing Supabase env vars")
          return null
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error || !data?.user) {
          return null
        }

        const user = data.user
        const role = (user.user_metadata as any)?.role || "PATIENT"
        const name = (user.user_metadata as any)?.name || user.email || undefined

        return { id: user.id, email: user.email!, name, role }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        ;(token as any).id = (user as any).id
        ;(token as any).role = (user as any).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = (token as any).id
        ;(session.user as any).role = (token as any).role
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)

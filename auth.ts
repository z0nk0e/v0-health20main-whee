import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { AuthConfig } from "@auth/core/types"

const config: AuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const [{ getDb }, { users }, { eq }, bcrypt] = await Promise.all([
          import("@/lib/db/connection"),
          import("@/lib/db/schema"),
          import("drizzle-orm"),
          import("bcryptjs"),
        ])

        const db = getDb()
        const [u] = await db
          .select({
            id: users.id,
            email: users.email,
            passwordHash: users.passwordHash,
            role: users.role,
            name: users.name,
          })
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        if (!u) return null
        const ok = await bcrypt.compare(credentials.password as string, u.passwordHash ?? "")
        if (!ok) return null

        return { id: u.id, email: u.email, name: u.name, role: u.role }
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

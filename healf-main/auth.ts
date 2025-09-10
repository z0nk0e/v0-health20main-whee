import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getDb } from "@/lib/db/connection"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import type { AuthConfig } from "@auth/core/types"
type NextAuthFunction = (config: AuthConfig) => {
  handlers: any;
  signIn: any;
  signOut: any;
  auth: any;
};

const NextAuthCallable = NextAuth as unknown as NextAuthFunction;

export const config: AuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const db = getDb()

        const [foundUser] = await db
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

        if (!foundUser) return null

        const isValidPassword = await bcrypt.compare(credentials.password as string, foundUser.passwordHash || "")

        if (!isValidPassword) {
          return null
        }
        
        return {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
}

export const { handlers, signIn, signOut, auth } = NextAuthCallable(config)
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getDb } from "@/lib/db/connection"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import type { AuthConfig } from "@auth/core/types"
import { JWT } from "next-auth/jwt"
import { Session, User } from "next-auth"
import type { AdapterUser } from "@auth/core/adapters"
import type { Account, Profile } from "@auth/core/types"
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

        const userArray = await db
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

        if (userArray.length === 0) {
          return null
        }

        const foundUser = userArray[0]

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
    async jwt({ token, user }) {
      if (user) {
        if ('role' in user) {
          token.role = user.role as "PATIENT" | "PRESCRIBER";
        }
        if ('id' in user) {
          token.id = user.id as string;
        }
      }
      return token
    },
    async session({ session, token, user, newSession, trigger }) {
      if (token && session.user && token.id && token.role) {
        session.user.id = token.id as string
        session.user.role = token.role as "PATIENT" | "PRESCRIBER"
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
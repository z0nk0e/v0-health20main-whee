import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      role: "PATIENT" | "PRESCRIBER"
    } & DefaultSession["user"]
  }

  interface User {
    role: "PATIENT" | "PRESCRIBER"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "PATIENT" | "PRESCRIBER"
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: "PATIENT" | "PRESCRIBER";
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: "PATIENT" | "PRESCRIBER"
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: "PATIENT" | "PRESCRIBER"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "PATIENT" | "PRESCRIBER"
  }
}

"use client"

import { SessionProvider } from "next-auth/react"
import { ClientLayout } from "@/components/client-layout"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ClientLayout>{children}</ClientLayout>
    </SessionProvider>
  )
}

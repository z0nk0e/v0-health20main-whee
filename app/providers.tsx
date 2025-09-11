"use client"

import type React from "react"
import { PosthogProvider } from "@/components/providers/posthog-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return <PosthogProvider>{children}</PosthogProvider>
}

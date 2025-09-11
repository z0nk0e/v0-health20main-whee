"use client"

import { useEffect } from "react"
import posthog from "posthog-js"

export function PosthogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"
    if (!key) return
    if (!posthog.__loaded) {
      posthog.init(key, {
        api_host: host,
        capture_pageview: true,
        capture_pageleave: true,
        persistence: "localStorage",
        autocapture: true,
      })
    }
  }, [])

  return <>{children}</>
}

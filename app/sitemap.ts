import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const now = new Date()
  const routes = [
    "/",
    "/about",
    "/how-it-works",
    "/for-providers",
    "/auth/signin",
    "/auth/signup",
    "/upgrade",
    "/account",
    "/payment-success",
    "/payment-cancelled",
  ]
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7,
  }))
}

import { type NextRequest, NextResponse } from "next/server"

export default function middleware(req: NextRequest) {
  // Only use Clerk middleware if environment variables are available
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) {
    // Dynamic import to avoid loading Clerk when not configured
    return import("@clerk/nextjs/server").then(({ clerkMiddleware, createRouteMatcher }) => {
      const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/profile(.*)", "/search(.*)"])

      return clerkMiddleware((auth, req) => {
        if (isProtectedRoute(req)) {
          auth().protect()
        }
      })(req)
    })
  }

  // If no Clerk configuration, just pass through
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}

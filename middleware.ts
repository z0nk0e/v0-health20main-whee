import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req: NextRequest & { auth?: any }) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth/signin", "/auth/signup", "/api/search", "/api/autocomplete"]

  // Prescriber-only routes
  const prescriberRoutes = ["/prescriber"]
  const isPrescriberRoute = prescriberRoutes.some((route) => pathname.startsWith(route))

  if (isPrescriberRoute && (!isLoggedIn || userRole !== "PRESCRIBER")) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  // If accessing auth pages while logged in, redirect to appropriate dashboard
  if (isLoggedIn && (pathname.startsWith("/auth/signin") || pathname.startsWith("/auth/signup"))) {
    if (userRole === "PRESCRIBER") {
      return NextResponse.redirect(new URL("/prescriber/dashboard", req.url))
    }
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Protect routes that are not public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}


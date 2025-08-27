"use client"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

const clerkAvailable = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_placeholder"
)

function ClerkAuthSection() {
  // Only import and use Clerk hooks inside this component when Clerk is available
  const { SignInButton, SignUpButton, UserButton, useUser } = require("@clerk/nextjs")
  const { isSignedIn, user } = useUser()

  if (isSignedIn) {
    return (
      <div className="flex items-center space-x-3">
        <span className="hidden sm:inline text-sm text-muted-foreground">
          Welcome, {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
        </span>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </div>
    )
  }

  return (
    <>
      <SignInButton mode="modal">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="sm">Get Started</Button>
      </SignUpButton>
    </>
  )
}

function FallbackAuthSection() {
  const [showAuthFallback, setShowAuthFallback] = useState(false)

  const handleAuthClick = () => {
    setShowAuthFallback(true)
    setTimeout(() => setShowAuthFallback(false), 3000)
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleAuthClick}>
        Sign In
      </Button>
      <Button size="sm" onClick={handleAuthClick}>
        Get Started
      </Button>
      {showAuthFallback && (
        <div className="absolute top-16 right-4 bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">
            Authentication demo - Clerk integration available in production
          </p>
        </div>
      )}
    </>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Image
              src="/rx-prescribers-logo.png"
              alt="RX Prescribers Logo"
              width={400}
              height={106}
              className="h-20 w-auto"
              priority
            />
          </Link>
        </div>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/how-it-works" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                  How It Works
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/for-providers" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                  For Providers
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                  About
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center space-x-2">
          {clerkAvailable ? <ClerkAuthSection /> : <FallbackAuthSection />}
        </div>
      </div>
    </header>
  )
}

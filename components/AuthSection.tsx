// components/AuthSection.tsx

"use client"; // This component MUST be a client component

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

// Check if Clerk is configured
const clerkAvailable = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_placeholder"
);

function ClerkAuth() {
  const { user } = useUser();
  
  return (
    <>
      <SignedIn>
        <div className="flex items-center space-x-3">
          <span className="hidden sm:inline text-sm text-muted-foreground">
            Welcome, {user?.firstName}
          </span>
          <UserButton
            appearance={{
              elements: { avatarBox: "w-8 h-8" },
            }}
          />
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex items-center space-x-3">
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">Get Started</Button>
          </SignUpButton>
        </div>
      </SignedOut>
    </>
  );
}

function FallbackAuth() {
  const [showAuthFallback, setShowAuthFallback] = useState(false);

  const handleAuthClick = () => {
    setShowAuthFallback(true);
    setTimeout(() => setShowAuthFallback(false), 3000);
  };

  return (
    <div className="relative flex items-center space-x-3">
      <Button variant="ghost" size="sm" onClick={handleAuthClick}>
        Sign In
      </Button>
      <Button size="sm" onClick={handleAuthClick}>
        Get Started
      </Button>
      {showAuthFallback && (
        <div className="absolute top-12 right-0 bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">
            Authentication is not configured.
          </p>
        </div>
      )}
    </div>
  );
}

// This is the main component you will import into your Header
export function AuthSection() {
  return clerkAvailable ? <ClerkAuth /> : <FallbackAuth />;
}

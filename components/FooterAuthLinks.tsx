// components/FooterAuthLinks.tsx

"use client"; // This component must run on the client

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export function FooterAuthLinks() {
  return (
    <>
      <SignedIn>
        {/* This link will only show if the user is signed in */}
        <li>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
        </li>
      </SignedIn>
      <SignedOut>
        {/* This link will only show if the user is signed out */}
        <li>
          <SignInButton mode="modal">
            <button className="hover:text-foreground transition-colors">
              Sign In
            </button>
          </SignInButton>
        </li>
      </SignedOut>
    </>
  );
}

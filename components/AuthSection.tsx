// components/AuthSection.tsx
"use client"; // This component MUST be a client component
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { useSession, signIn, signOut } from "next-auth/react";

export function AuthSection() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center space-x-3">
        <span className="hidden sm:inline text-sm text-muted-foreground">
          Welcome, {session.user?.name || session.user?.email}
        </span>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Button variant="ghost" size="sm" onClick={() => signIn()}>
        Sign In
      </Button>
      <Button size="sm" onClick={() => signIn()}>
        Get Started
      </Button>
    </div>
  );
}

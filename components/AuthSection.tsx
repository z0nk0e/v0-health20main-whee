// components/AuthSection.tsx
"use client"; // This component MUST be a client component
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { useSession, signIn, signOut } from "next-auth/react";

export function AuthSection() {
  const { data: session } = useSession();
  const [plan, setPlan] = useState<string | null>(null)

  // Fetch plan when signed in
  if (typeof window !== 'undefined' && session && plan === null) {
    fetch('/api/me/access').then(async (res) => {
      if (res.ok) {
        const d = await res.json();
        setPlan(d.plan || 'FREE');
      } else {
        setPlan('FREE');
      }
    }).catch(() => setPlan('FREE'))
  }

  const upgradeClass = plan === 'FREE' ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse' : ''

  if (session) {
    return (
      <div className="flex items-center space-x-3">
        <a href="/upgrade" className={`hidden sm:inline px-3 py-2 text-sm rounded border ${upgradeClass}`}>Upgrade</a>
        <a href="/account" className="hidden sm:inline px-3 py-2 text-sm rounded border">Account</a>
        <span className="hidden md:inline text-sm text-muted-foreground">
          {session.user?.name || session.user?.email}
        </span>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <a href="/upgrade" className="hidden sm:inline px-3 py-2 text-sm rounded border">Upgrade</a>
      <Button variant="ghost" size="sm" onClick={() => signIn()}>
        Sign In
      </Button>
      <Button size="sm" onClick={() => signIn()}>
        Get Started
      </Button>
    </div>
  );
}

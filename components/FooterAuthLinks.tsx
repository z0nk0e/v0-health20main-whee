// components/FooterAuthLinks.tsx

"use client"; // This component must run on the client

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export function FooterAuthLinks() {
  const { data: session } = useSession();

  return (
    <>
      {session ? (
        <li>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
        </li>
      ) : (
        <li>
          <button onClick={() => signIn()} className="hover:text-foreground transition-colors">
            Sign In
          </button>
        </li>
      )}
    </>
  );
}

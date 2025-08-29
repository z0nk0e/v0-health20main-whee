// components/Header.tsx (This is now a Server Component)

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import Image from "next/image";
import { AuthSection } from "./AuthSection"; // <-- IMPORT our new client component

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-card backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-20 items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 modern-hover group">
            <Image
              src="/rx-prescribers-logo.png"
              alt="RX Prescribers Logo"
              width={400}
              height={106}
              className="h-20 w-auto transition-all duration-300 group-hover:scale-105"
              priority
            />
          </Link>
        </div>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="space-x-2">
            {/* ... Your NavigationMenuItems are unchanged ... */}
            <NavigationMenuItem>
              <Link href="/how-it-works" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-12 w-max items-center justify-center rounded-xl bg-background/50 backdrop-blur-sm px-6 py-2 text-sm font-medium transition-all duration-300 hover:bg-accent/10 hover:text-accent-foreground hover:scale-105 hover:shadow-lg focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 border border-border/20">
                  How It Works
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/for-providers" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-12 w-max items-center justify-center rounded-xl bg-background/50 backdrop-blur-sm px-6 py-2 text-sm font-medium transition-all duration-300 hover:bg-accent/10 hover:text-accent-foreground hover:scale-105 hover:shadow-lg focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 border border-border/20">
                  For Providers
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink className="group inline-flex h-12 w-max items-center justify-center rounded-xl bg-background/50 backdrop-blur-sm px-6 py-2 text-sm font-medium transition-all duration-300 hover:bg-accent/10 hover:text-accent-foreground hover:scale-105 hover:shadow-lg focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 border border-border/20">
                  About
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* --- THIS IS THE ONLY PART THAT CHANGED --- */}
        {/* We now render our self-contained client component here */}
        <AuthSection />
        
      </div>
    </header>
  );
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function titleCase(segment: string) {
  return segment
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const items = [{ href: "/", label: "Home" } as const]

  let path = ""
  for (const seg of segments) {
    path += `/${seg}`
    // Friendly names for known segments
    const labelMap: Record<string, string> = {
      prescriber: "Prescriber",
      dashboard: "Dashboard",
      profile: "Profile",
      subscription: "Subscription",
      auth: "Auth",
      signin: "Sign In",
      signup: "Sign Up",
    }
    items.push({ href: path, label: labelMap[seg] ?? titleCase(seg) })
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, idx) => (
          <>
            <BreadcrumbItem key={item.href}>
              {idx < items.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {idx < items.length - 1 ? <BreadcrumbSeparator /> : null}
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

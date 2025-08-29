import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3, Kalam, Dancing_Script } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
})

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
  variable: "--font-handwriting",
})

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-signature",
})

export const metadata: Metadata = {
  title: "RX Prescribers - Find Healthcare Providers Who Prescribe Specific Medications",
  description:
    "Connect with healthcare providers who prescribe the medications you need. Search our database of 825K+ providers and 4.5M+ prescription records.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  if (!clerkPublishableKey) {
  console.warn("[v0] Clerk publishable key not found, authentication will be disabled")
   }

  if (!paypalClientId) {
    console.warn("[v0] PayPal client ID not found, PayPal functionality will be disabled")
   }

  const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
  }

  const PayPalWrapper = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
  }

  return (
    <AuthWrapper>
      <PayPalWrapper>
        <html
          lang="en"
          className={`${playfair.variable} ${sourceSans.variable} ${kalam.variable} ${dancingScript.variable} antialiased`}
        >
          <body className="font-sans">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">{children}</div>
          </body>
        </html>
      </PayPalWrapper>
    </AuthWrapper>
  )
}

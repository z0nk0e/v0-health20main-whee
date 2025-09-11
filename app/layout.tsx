import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3, Kalam, Dancing_Script } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import { Analytics } from "@vercel/analytics/next"
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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "RX Prescribers - Find Healthcare Providers Who Prescribe Specific Medications",
    template: "%s | RX Prescribers",
  },
  description:
    "Connect with healthcare providers who prescribe the medications you need. Search our database of 825K+ providers and 4.5M+ prescription records.",
  generator: "v0.app",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: baseUrl,
    siteName: "RX Prescribers",
    title: "RX Prescribers - Find Healthcare Providers Who Prescribe Specific Medications",
    description:
      "Connect with healthcare providers who prescribe the medications you need. Search our database of 825K+ providers and 4.5M+ prescription records.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "RX Prescribers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RX Prescribers",
    description:
      "Find providers who prescribe the medications you need. Search 825K+ providers and 4.5M+ prescription records.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  if (!paypalClientId) {
    console.warn("[v0] PayPal client ID not found, PayPal functionality will be disabled")
  }

  const PayPalWrapper = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
  }

  return (
    <SessionProvider>
      <PayPalWrapper>
        <html
          lang="en"
          className={`${playfair.variable} ${sourceSans.variable} ${kalam.variable} ${dancingScript.variable} antialiased`}
        >
          <body className="font-sans">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">{children}</div>
            <Analytics />
          </body>
        </html>
      </PayPalWrapper>
    </SessionProvider>
  )
}

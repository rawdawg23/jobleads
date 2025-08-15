import type React from "react"
import type { Metadata } from "next"
import { DM_Sans, DM_Serif_Display } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/simple-auth"
import SiteMessageBanner from "@/components/site-message-banner"
import { ErrorBoundary } from "@/components/error-boundary"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
})

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-serif",
  weight: ["400"],
})

export const metadata: Metadata = {
  title: "CTEK JOB LEADS - Professional ECU Remapping Network",
  description: "Connect with certified ECU specialists. Professional ECU remapping jobs and dealer network.",
  generator: "v0.app",
  keywords:
    "ECU remapping, ECU tuning, car tuning, performance tuning, diesel tuning, chip tuning, professional ECU, certified dealers",
  authors: [{ name: "CTEK JOB LEADS" }],
  creator: "CTEK JOB LEADS",
  publisher: "CTEK JOB LEADS",
  openGraph: {
    title: "CTEK JOB LEADS - Professional ECU Remapping Network",
    description: "Connect with certified ECU specialists. Professional ECU remapping jobs and dealer network.",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "CTEK JOB LEADS - Professional ECU Remapping Network",
    description: "Connect with certified ECU specialists. Professional ECU remapping jobs and dealer network.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SiteMessageBanner />
      {children}
    </AuthProvider>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerifDisplay.variable} antialiased`}>
      <body className="font-sans">
        <ErrorBoundary>
          <ClientProviders>{children}</ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  )
}

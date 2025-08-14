import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
// import { AuthProvider } from "@/hooks/use-auth"

export const metadata: Metadata = {
  title: "CTEK JOB LEADS - Professional ECU Remapping Network",
  description: "Connect with certified ECU specialists. Professional ECU remapping jobs and dealer network.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* <AuthProvider>{children}</AuthProvider> */}
      </body>
    </html>
  )
}

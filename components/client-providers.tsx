"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import SiteMessageBanner from "@/components/site-message-banner"

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SiteMessageBanner />
      {children}
    </SessionProvider>
  )
}

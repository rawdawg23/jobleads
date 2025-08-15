import type React from "react"
import type { Metadata } from "next"
import { DM_Sans, DM_Serif_Display } from "next/font/google"
import "./globals.css"
import SiteMessageBanner from "@/components/site-message-banner"
import { ErrorBoundary } from "@/components/error-boundary"
import { AuthProvider } from "@/hooks/use-auth"
// import { SimpleRedirectHandler } from "@/components/simple-redirect-handler"

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
  title: "ECU Remapping UK | Professional Engine Tuning & DPF Delete Services | CTEK",
  description:
    "UK's leading ECU remapping specialists. Professional engine tuning, DPF delete, EGR removal, live dyno testing & car meet locations. Stage 1-3 performance maps. Mobile & workshop services nationwide.",
  generator: "v0.app",
  keywords: [
    // Core ECU remapping terms
    "ECU remapping UK",
    "engine tuning UK",
    "car remapping",
    "ECU tuning",
    "chip tuning UK",
    "performance remapping",
    "diesel tuning",
    "petrol tuning",
    "stage 1 remap",
    "stage 2 remap",
    "stage 3 remap",

    // DPF and emissions services
    "DPF delete UK",
    "DPF removal",
    "EGR delete",
    "EGR removal",
    "AdBlue delete",
    "emissions delete",
    "DPF problems",
    "regeneration issues",
    "diesel particulate filter",

    // Performance and economy
    "increase horsepower",
    "increase torque",
    "fuel economy tuning",
    "mpg improvement",
    "performance gains",
    "power increase",
    "torque increase",

    // Service types
    "mobile ECU remapping",
    "workshop tuning",
    "same day service",
    "professional tuning",
    "certified ECU specialist",
    "IMI qualified",
    "insured tuning service",

    // Vehicle types
    "car tuning",
    "van tuning",
    "truck tuning",
    "fleet remapping",
    "commercial vehicle tuning",
    "BMW tuning",
    "Audi tuning",
    "Mercedes tuning",
    "VW tuning",
    "Ford tuning",

    // Location-based
    "ECU remapping near me",
    "local ECU specialist",
    "UK wide service",
    "nationwide coverage",
    "car meet locations",
    "automotive events",
    "tuning community",

    // Technology
    "live dyno testing",
    "rolling road",
    "diagnostic tools",
    "OBD tuning",
    "ECU diagnostics",
    "real-time monitoring",
    "performance testing",
    "dyno results",
  ].join(", "),
  authors: [{ name: "CTEK ECU Remapping Specialists" }],
  creator: "CTEK ECU Remapping Network",
  publisher: "CTEK Professional Automotive Services",
  category: "Automotive Services",
  classification: "ECU Remapping and Engine Tuning Services",
  openGraph: {
    title: "ECU Remapping UK | Professional Engine Tuning & DPF Delete Services | CTEK",
    description:
      "UK's leading ECU remapping specialists. Professional engine tuning, DPF delete, EGR removal, live dyno testing & car meet locations. Stage 1-3 performance maps. Mobile & workshop services nationwide.",
    type: "website",
    locale: "en_GB",
    url: "https://ctek.club",
    siteName: "CTEK ECU Remapping Network",
    images: [
      {
        url: "/favicon.png",
        width: 1200,
        height: 630,
        alt: "CTEK ECU Remapping - Professional Engine Tuning Services UK",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@CTEKRemapping",
    creator: "@CTEKRemapping",
    title: "ECU Remapping UK | Professional Engine Tuning & DPF Delete Services | CTEK",
    description:
      "UK's leading ECU remapping specialists. Professional engine tuning, DPF delete, EGR removal, live dyno testing & car meet locations. Stage 1-3 performance maps.",
    images: ["/favicon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://ctek.club",
  },
  other: {
    "geo.region": "GB",
    "geo.country": "United Kingdom",
    "geo.placename": "United Kingdom",
    ICBM: "54.7023545,-3.2765753",
    "DC.title": "ECU Remapping UK - Professional Engine Tuning Services",
    "DC.creator": "CTEK ECU Remapping Network",
    "DC.subject": "ECU Remapping, Engine Tuning, DPF Delete, Automotive Services",
    "DC.description": "Professional ECU remapping and engine tuning services across the UK",
    "DC.publisher": "CTEK Professional Automotive Services",
    "DC.contributor": "Certified ECU Specialists",
    "DC.date": "2025-01-15T20:39:00.000Z",
    "DC.type": "Service",
    "DC.format": "text/html",
    "DC.identifier": "https://ctek.club",
    "DC.language": "en-GB",
    "DC.coverage": "United Kingdom",
    "DC.rights": "Copyright CTEK ECU Remapping Network",
  },
  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/svg+xml",
      },
      {
        url: "/favicon.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
    apple: {
      url: "/favicon.png",
      sizes: "180x180",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-GB" className={`${dmSans.variable} ${dmSerifDisplay.variable} antialiased`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="canonical" href="https://ctek.club" />

        {/* Structured Data for Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutomotiveBusiness",
              name: "CTEK ECU Remapping Network",
              description:
                "Professional ECU remapping, engine tuning, DPF delete and automotive diagnostic services across the UK",
              url: "https://ctek.club",
              logo: "https://ctek.club/favicon.png",
              image: "https://ctek.club/favicon.png",
              telephone: "+44-800-ECU-REMAP",
              email: "info@ctekremapping.co.uk",
              address: {
                "@type": "PostalAddress",
                addressCountry: "GB",
                addressRegion: "United Kingdom",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "54.7023545",
                longitude: "-3.2765753",
              },
              areaServed: {
                "@type": "Country",
                name: "United Kingdom",
              },
              serviceType: [
                "ECU Remapping",
                "Engine Tuning",
                "DPF Delete",
                "EGR Removal",
                "Performance Tuning",
                "Diagnostic Services",
              ],
              priceRange: "££",
              paymentAccepted: ["Cash", "Credit Card", "Bank Transfer"],
              currenciesAccepted: "GBP",
              openingHours: "Mo-Fr 08:00-18:00, Sa 08:00-16:00",
              sameAs: [
                "https://facebook.com/ctekremapping",
                "https://twitter.com/ctekremapping",
                "https://instagram.com/ctekremapping",
              ],
            }),
          }}
        />

        {/* Structured Data for Service */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              name: "Professional ECU Remapping Services",
              description: "Expert ECU remapping, engine tuning, DPF delete and performance optimization services",
              provider: {
                "@type": "Organization",
                name: "CTEK ECU Remapping Network",
              },
              areaServed: {
                "@type": "Country",
                name: "United Kingdom",
              },
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "ECU Remapping Services",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Stage 1 ECU Remap",
                      description: "15-25% power increase with Stage 1 performance mapping",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "DPF Delete Service",
                      description: "Professional DPF removal and ECU mapping service",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Economy Tuning",
                      description: "Fuel economy optimization for better MPG",
                    },
                  },
                ],
              },
            }),
          }}
        />

        {/* Additional SEO meta tags */}
        <meta name="theme-color" content="#10b981" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=yes" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="width" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </head>
      <body className="font-sans">
        <ErrorBoundary>
          <AuthProvider>
            <SiteMessageBanner />
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

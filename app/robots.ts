import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/private/", "/_next/", "/auth/reset-password"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin/", "/private/"],
      },
    ],
    sitemap: "https://jobleads-zmku-m7dds5tmr-grgg.vercel.app/sitemap.xml",
    host: "https://jobleads-zmku-m7dds5tmr-grgg.vercel.app",
  }
}

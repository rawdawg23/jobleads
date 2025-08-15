import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { domain, force = false } = await request.json()

    // Get current domain from database
    const { data: existingDomain, error: fetchError } = await supabase
      .from("domains")
      .select("*")
      .eq("domain", domain)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError
    }

    // Auto-detect current domain status
    const domainStatus = await checkDomainStatus(domain)

    if (existingDomain) {
      // Update existing domain if status changed or force update
      const statusChanged =
        existingDomain.status !== domainStatus.status ||
        existingDomain.ssl_status !== domainStatus.ssl_status ||
        existingDomain.dns_status !== domainStatus.dns_status

      if (statusChanged || force) {
        const { data: updatedDomain, error: updateError } = await supabase
          .from("domains")
          .update({
            status: domainStatus.status,
            ssl_status: domainStatus.ssl_status,
            dns_status: domainStatus.dns_status,
            last_checked: new Date().toISOString(),
            metadata: {
              ...existingDomain.metadata,
              auto_updated: true,
              last_auto_update: new Date().toISOString(),
              previous_status: existingDomain.status,
            },
          })
          .eq("domain", domain)
          .select()
          .single()

        if (updateError) throw updateError

        return NextResponse.json({
          success: true,
          domain: updatedDomain,
          updated: true,
          changes: {
            status: existingDomain.status !== domainStatus.status,
            ssl_status: existingDomain.ssl_status !== domainStatus.ssl_status,
            dns_status: existingDomain.dns_status !== domainStatus.dns_status,
          },
        })
      } else {
        return NextResponse.json({
          success: true,
          domain: existingDomain,
          updated: false,
          message: "No changes detected",
        })
      }
    } else {
      // Create new domain entry
      const { data: newDomain, error: createError } = await supabase
        .from("domains")
        .insert({
          domain,
          status: domainStatus.status,
          ssl_status: domainStatus.ssl_status,
          dns_status: domainStatus.dns_status,
          last_checked: new Date().toISOString(),
          metadata: {
            auto_created: true,
            created_via: "auto-update",
            first_detected: new Date().toISOString(),
          },
        })
        .select()
        .single()

      if (createError) throw createError

      return NextResponse.json({
        success: true,
        domain: newDomain,
        created: true,
      })
    }
  } catch (error) {
    console.error("Auto-update error:", error)
    return NextResponse.json({ success: false, error: "Failed to auto-update domain" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get all domains from database
    const { data: domains, error: fetchError } = await supabase.from("domains").select("*")

    if (fetchError) throw fetchError

    const results = []

    for (const domain of domains) {
      try {
        const domainStatus = await checkDomainStatus(domain.domain)

        const statusChanged =
          domain.status !== domainStatus.status ||
          domain.ssl_status !== domainStatus.ssl_status ||
          domain.dns_status !== domainStatus.dns_status

        if (statusChanged) {
          const { data: updatedDomain, error: updateError } = await supabase
            .from("domains")
            .update({
              status: domainStatus.status,
              ssl_status: domainStatus.ssl_status,
              dns_status: domainStatus.dns_status,
              last_checked: new Date().toISOString(),
              metadata: {
                ...domain.metadata,
                auto_updated: true,
                last_auto_update: new Date().toISOString(),
                previous_status: domain.status,
              },
            })
            .eq("id", domain.id)
            .select()
            .single()

          if (updateError) throw updateError

          results.push({
            domain: domain.domain,
            updated: true,
            changes: {
              status: domain.status !== domainStatus.status,
              ssl_status: domain.ssl_status !== domainStatus.ssl_status,
              dns_status: domain.dns_status !== domainStatus.dns_status,
            },
          })
        } else {
          results.push({
            domain: domain.domain,
            updated: false,
            message: "No changes detected",
          })
        }
      } catch (error) {
        results.push({
          domain: domain.domain,
          error: error.message,
          updated: false,
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      total_domains: domains.length,
      updated_count: results.filter((r) => r.updated).length,
    })
  } catch (error) {
    console.error("Bulk auto-update error:", error)
    return NextResponse.json({ success: false, error: "Failed to bulk auto-update domains" }, { status: 500 })
  }
}

async function checkDomainStatus(domain: string) {
  // Simulate domain status checking (replace with real checks)
  const isAvailable = Math.random() > 0.7
  const hasSSL = Math.random() > 0.3
  const hasDNS = Math.random() > 0.2

  return {
    status: isAvailable ? "available" : "registered",
    ssl_status: hasSSL ? "active" : "inactive",
    dns_status: hasDNS ? "configured" : "not_configured",
  }
}

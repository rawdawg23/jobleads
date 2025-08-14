import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is already a dealer
    const { data: existingDealer } = await supabase.from("dealers").select("id").eq("user_id", user.id).single()

    if (existingDealer) {
      return NextResponse.json({ error: "You are already registered as a dealer" }, { status: 400 })
    }

    const {
      businessName,
      businessAddress,
      businessPostcode,
      vatNumber,
      insuranceDetails,
      certifications,
      selectedTools,
      radiusMiles,
    } = await request.json()

    if (
      !businessName ||
      !businessAddress ||
      !businessPostcode ||
      !insuranceDetails ||
      !certifications.length ||
      !selectedTools.length
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create dealer record
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .insert({
        user_id: user.id,
        business_name: businessName,
        business_address: businessAddress,
        business_postcode: businessPostcode.toUpperCase(),
        vat_number: vatNumber || null,
        insurance_details: insuranceDetails,
        certifications,
        status: "pending",
        radius_miles: radiusMiles,
      })
      .select()
      .single()

    if (dealerError) {
      console.error("Dealer creation error:", dealerError)
      return NextResponse.json({ error: "Failed to create dealer profile" }, { status: 500 })
    }

    // Create tool associations
    const toolInserts = selectedTools.map((toolId: string) => ({
      dealer_id: dealer.id,
      tool_id: toolId,
    }))

    const { error: toolsError } = await supabase.from("dealer_tools").insert(toolInserts)

    if (toolsError) {
      console.error("Tools association error:", toolsError)
      // Continue anyway, tools can be added later
    }

    // Create payment record for dealer subscription
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: user.id,
      amount: 100.0,
      currency: "GBP",
      payment_type: "dealer_subscription",
      reference_id: dealer.id,
      status: "pending",
    })

    if (paymentError) {
      console.error("Payment creation error:", paymentError)
      return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 })
    }

    // Update user role to dealer
    const { error: roleError } = await supabase.from("users").update({ role: "dealer" }).eq("id", user.id)

    if (roleError) {
      console.error("Role update error:", roleError)
      // Continue anyway, role can be updated manually
    }

    return NextResponse.json({
      dealerId: dealer.id,
      success: true,
    })
  } catch (error) {
    console.error("Dealer registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

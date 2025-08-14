import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/redis/auth"
import { DealerModel, PaymentModel } from "@/lib/redis/extended-models"
import { UserModel } from "@/lib/redis/models"

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const result = await AuthService.getCurrentUser()

    if (!result) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user } = result

    // Check if user is already a dealer
    const existingDealer = await DealerModel.findByUserId(user.id)

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
      !certifications?.length ||
      !selectedTools?.length
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create dealer record
    const dealer = await DealerModel.create({
      userId: user.id,
      businessName,
      businessAddress,
      businessPostcode: businessPostcode.toUpperCase(),
      vatNumber: vatNumber || undefined,
      insuranceDetails,
      certifications,
      status: "pending",
      radiusMiles,
      tools: selectedTools,
    })

    // Create payment record for dealer subscription
    await PaymentModel.create({
      userId: user.id,
      amount: 100.0,
      currency: "GBP",
      paymentType: "dealer_subscription",
      referenceId: dealer.id,
      status: "pending",
    })

    // Update user role to dealer
    await UserModel.update(user.id, { role: "dealer" })

    return NextResponse.json({
      dealerId: dealer.id,
      success: true,
    })
  } catch (error) {
    console.error("Dealer registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

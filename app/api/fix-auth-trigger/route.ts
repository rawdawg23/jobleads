import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] Checking auth trigger status...")

    // Create service role client
    const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Check current trigger function
    const { data: triggerInfo, error: triggerError } = await supabaseAdmin
      .from("information_schema.routines")
      .select("routine_definition")
      .eq("routine_name", "handle_new_user")
      .eq("routine_schema", "public")
      .single()

    if (triggerError) {
      console.log("[v0] Error checking trigger:", triggerError)
      return NextResponse.json({
        status: "error",
        message: "Could not check trigger status",
        error: triggerError.message,
      })
    }

    const triggerDefinition = triggerInfo?.routine_definition || ""
    const hasBrokenPhone = triggerDefinition.includes("phone")
    const hasBrokenUserRole = triggerDefinition.includes("user_role")

    console.log("[v0] Trigger analysis:", { hasBrokenPhone, hasBrokenUserRole })

    if (hasBrokenPhone || hasBrokenUserRole) {
      return NextResponse.json({
        status: "broken",
        message: "Auth trigger has column mismatch issues",
        issues: {
          brokenPhoneColumn: hasBrokenPhone,
          brokenUserRoleCast: hasBrokenUserRole,
        },
        fixInstructions: [
          "1. Open Supabase Dashboard → SQL Editor",
          "2. Run the script: scripts/04-create-auth-trigger.sql",
          "3. This will fix the column mismatch in the auth trigger",
          "4. Test user registration after applying the fix",
        ],
        sqlFix: `-- Run this in Supabase SQL Editor to fix the auth trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`,
      })
    }

    return NextResponse.json({
      status: "fixed",
      message: "Auth trigger appears to be correctly configured",
      triggerDefinition: triggerDefinition.substring(0, 200) + "...",
    })
  } catch (error: any) {
    console.error("[v0] Trigger check exception:", error)
    return NextResponse.json({
      status: "error",
      message: "Failed to check trigger status",
      error: error.message,
    })
  }
}

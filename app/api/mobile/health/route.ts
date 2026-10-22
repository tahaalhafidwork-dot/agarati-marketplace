import { NextResponse } from "next/server"

import { isDatabaseConfigured } from "@/lib/db"
import { isSupabaseConfigured } from "@/lib/supabase/config"

/**
 * Mobile foundation liveness — no secrets, no business mutations.
 * Used by apps/mobile to verify the real backend is reachable.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "agarati-mobile",
    phase: "foundation",
    timestamp: new Date().toISOString(),
    checks: {
      supabaseConfigured: isSupabaseConfigured(),
      databaseConfigured: isDatabaseConfigured(),
    },
  })
}

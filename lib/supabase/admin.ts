import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/** Service-role client for trusted server operations. */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Service role not configured. See docs/SUPABASE_SETUP.md")
  }
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

import { createBrowserClient } from "@supabase/ssr"

import { isSupabaseConfigured } from "@/lib/supabase/config"

export { isSupabaseConfigured }

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error("Supabase is not configured. See docs/SUPABASE_SETUP.md")
  }
  return createBrowserClient(url, key)
}

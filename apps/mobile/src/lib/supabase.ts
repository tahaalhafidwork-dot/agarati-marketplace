import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Supabase client for the mobile app (same project as web).
 * Requires EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY.
 * No service-role key on device — ever.
 */
let cached: SupabaseClient | null | undefined

export function createMobileSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim()
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!url || !anon) {
    cached = null
    return cached
  }

  cached = createClient(url, anon, {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  })
  return cached
}

/** True when public env is present (client can be constructed). */
export function isMobileSupabaseConfigured(): boolean {
  return Boolean(
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim()
  )
}

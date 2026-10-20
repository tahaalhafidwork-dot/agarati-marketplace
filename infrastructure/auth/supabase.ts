/** Infrastructure: Supabase auth client helpers. */
export { createClient as createServerClient } from "@/lib/supabase/server"
export { createClient as createBrowserClient } from "@/lib/supabase/client"
export { isSupabaseConfigured } from "@/lib/supabase/config"

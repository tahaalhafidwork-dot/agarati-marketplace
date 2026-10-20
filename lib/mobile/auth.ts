import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

import { ensureUserProfile } from "@/lib/auth"
import { isDatabaseConfigured } from "@/lib/db"
import { isSupabaseConfigured } from "@/lib/supabase/config"

export type MobileAuthUser = {
  id: string
  email: string
  name: string
  phone: string | null
}

/**
 * Resolve the authenticated user from `Authorization: Bearer <access_token>`.
 * Thin helper for `/api/mobile/*` — does not change web cookie session paths.
 */
export async function getMobileUserFromRequest(
  request: Request
): Promise<MobileAuthUser | null> {
  if (!isSupabaseConfigured()) return null

  const header =
    request.headers.get("authorization") ||
    request.headers.get("Authorization")
  if (!header?.toLowerCase().startsWith("bearer ")) return null
  const token = header.slice(7).trim()
  if (!token) return null

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!url || !key) return null

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user?.email) return null

  const name =
    (data.user.user_metadata?.name as string | undefined) ||
    data.user.email.split("@")[0]
  const phone =
    (data.user.user_metadata?.phone as string | undefined) ?? null

  if (isDatabaseConfigured()) {
    await ensureUserProfile({
      id: data.user.id,
      email: data.user.email,
      name,
      phone,
    })
  }

  return {
    id: data.user.id,
    email: data.user.email,
    name,
    phone,
  }
}

export function mobileUnauthorizedResponse() {
  return NextResponse.json(
    { error: "يجب تسجيل الدخول.", code: "UNAUTHORIZED" },
    { status: 401 }
  )
}

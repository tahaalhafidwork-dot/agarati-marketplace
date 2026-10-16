import { NextResponse } from "next/server"

import { ensureUserProfile } from "@/lib/auth"
import { isDatabaseConfigured } from "@/lib/db"
import {
  getMobileUserFromRequest,
  mobileUnauthorizedResponse,
} from "@/lib/mobile/auth"

type Body = {
  name?: string
  phone?: string | null
}

/**
 * Thin mobile adapter — sync Prisma User after device Supabase signUp/signIn.
 * Mirrors the ensureUserProfile call inside web auth actions (no redirect).
 */
export async function POST(request: Request) {
  const user = await getMobileUserFromRequest(request)
  if (!user) return mobileUnauthorizedResponse()

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "قاعدة البيانات غير مُعدّة.", code: "DB" },
      { status: 503 }
    )
  }

  let body: Body = {}
  try {
    body = (await request.json()) as Body
  } catch {
    body = {}
  }

  const name = String(body.name ?? user.name).trim() || user.name
  const phone =
    body.phone === undefined
      ? user.phone
      : String(body.phone ?? "").trim() || null

  const profile = await ensureUserProfile({
    id: user.id,
    email: user.email,
    name,
    phone,
  })

  return NextResponse.json({
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
  })
}

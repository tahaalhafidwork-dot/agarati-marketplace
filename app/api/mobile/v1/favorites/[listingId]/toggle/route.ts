import { NextResponse } from "next/server"

import { toggleFavoriteForUser } from "@/application/favorites/toggle"
import { isDatabaseConfigured } from "@/lib/db"
import {
  getMobileUserFromRequest,
  mobileUnauthorizedResponse,
} from "@/lib/mobile/auth"

type Ctx = { params: Promise<{ listingId: string }> }

/**
 * Thin mobile adapter — favorite toggle.
 * Delegates to `toggleFavoriteForUser` (same SSOT as web Server Action).
 */
export async function POST(request: Request, ctx: Ctx) {
  const user = await getMobileUserFromRequest(request)
  if (!user) return mobileUnauthorizedResponse()

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "قاعدة البيانات غير مُعدّة.", code: "DB" },
      { status: 503 }
    )
  }

  const { listingId: raw } = await ctx.params
  const listingId = decodeURIComponent(raw)
  if (!listingId) {
    return NextResponse.json(
      { error: "معرّف الإعلان مطلوب.", code: "BAD_REQUEST" },
      { status: 400 }
    )
  }

  const result = await toggleFavoriteForUser(user.id, listingId)
  if (result.error) {
    const status = result.code === "NOT_FOUND" ? 404 : 400
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status }
    )
  }

  return NextResponse.json({
    favorited: Boolean(result.favorited),
    listingId,
  })
}

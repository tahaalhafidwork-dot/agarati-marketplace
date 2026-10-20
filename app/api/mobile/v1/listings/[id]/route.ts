import { NextResponse } from "next/server"

import { isDatabaseConfigured, prisma } from "@/lib/db"
import { serializeListingForMobile } from "@/lib/mobile/serialize-listing"
import { getMobileUserFromRequest } from "@/lib/mobile/auth"
import { fetchListingById } from "@/lib/listing-service"

type Ctx = { params: Promise<{ id: string }> }

/**
 * Thin mobile adapter — property detail. Delegates to fetchListingById.
 * When Bearer present, includes `favorited` from Prisma (same as web detail page).
 */
export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const listing = await fetchListingById(decodeURIComponent(id))
  if (!listing) {
    return NextResponse.json(
      { error: "الإعلان غير موجود", code: "NOT_FOUND" },
      { status: 404 }
    )
  }

  let favorited = false
  const user = await getMobileUserFromRequest(request)
  if (user && isDatabaseConfigured()) {
    const fav = await prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId: user.id, listingId: listing.id },
      },
      select: { id: true },
    })
    favorited = Boolean(fav)
  }

  return NextResponse.json({
    ...serializeListingForMobile(listing, request),
    favorited,
  })
}

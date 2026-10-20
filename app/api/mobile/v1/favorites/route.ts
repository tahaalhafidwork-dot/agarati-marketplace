import { NextResponse } from "next/server"

import { isDatabaseConfigured, prisma } from "@/lib/db"
import { toPublicListingCard } from "@/lib/listings"
import {
  getMobileUserFromRequest,
  mobileUnauthorizedResponse,
} from "@/lib/mobile/auth"
import { serializeListingForMobile } from "@/lib/mobile/serialize-listing"
import { publicListingVisibilityWhere } from "@/lib/listing-quota"

/**
 * Thin mobile adapter — list favorites for the Bearer user.
 * Same Prisma query shape as `app/dashboard/favorites/page.tsx`.
 */
export async function GET(request: Request) {
  const user = await getMobileUserFromRequest(request)
  if (!user) return mobileUnauthorizedResponse()

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "قاعدة البيانات غير مُعدّة.", code: "DB" },
      { status: 503 }
    )
  }

  const favorites = await prisma.favorite.findMany({
    where: {
      userId: user.id,
      listing: publicListingVisibilityWhere(),
    },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: {
          images: true,
          owner: {
            select: { id: true, name: true, phone: true, whatsapp: true },
          },
          agency: {
            select: {
              slug: true,
              name: true,
              phone: true,
              whatsapp: true,
              createdById: true,
            },
          },
          assignedAgent: { select: { id: true, name: true } },
        },
      },
    },
  })

  const cards = favorites.map((f) => toPublicListingCard(f.listing))

  return NextResponse.json({
    items: cards.map((card) => ({
      ...serializeListingForMobile(card, request),
      favorited: true,
    })),
    page: 1,
    pageSize: cards.length,
    total: cards.length,
  })
}

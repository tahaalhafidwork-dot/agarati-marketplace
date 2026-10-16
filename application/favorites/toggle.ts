import { prisma } from "@/lib/db"
import { isDatabaseConfigured } from "@/lib/db"
import { publicListingVisibilityWhere } from "@/lib/listing-quota"

export type ToggleFavoriteResult = {
  favorited?: boolean
  error?: string
  code?: string
}

/**
 * Server SSOT toggle for authenticated users.
 * Guest/demo paths are handled in the client facade.
 */
export async function toggleFavoriteForUser(
  userId: string,
  listingId: string
): Promise<ToggleFavoriteResult> {
  if (!isDatabaseConfigured()) {
    return { error: "قاعدة البيانات غير مُعدّة.", code: "DB" }
  }

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ...publicListingVisibilityWhere() },
    select: { id: true },
  })
  if (!listing) {
    return {
      error: "هذا إعلان تجريبي أو غير متاح للحفظ.",
      code: "NOT_FOUND",
    }
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_listingId: { userId, listingId },
    },
  })
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
  } else {
    await prisma.favorite.create({
      data: { userId, listingId },
    })
  }
  return { favorited: !existing }
}

/** Persist guest local IDs that map to ACTIVE listings; skip unknowns/demos. */
export async function syncGuestFavoritesOnLogin(
  userId: string,
  guestListingIds: string[]
): Promise<{ synced: number; syncedIds: string[] }> {
  if (!isDatabaseConfigured() || !guestListingIds.length) {
    return { synced: 0, syncedIds: [] }
  }
  const unique = [...new Set(guestListingIds.filter(Boolean))]
  const active = await prisma.listing.findMany({
    where: { id: { in: unique }, ...publicListingVisibilityWhere() },
    select: { id: true },
  })
  const syncedIds: string[] = []
  for (const row of active) {
    try {
      await prisma.favorite.upsert({
        where: {
          userId_listingId: { userId, listingId: row.id },
        },
        create: { userId, listingId: row.id },
        update: {},
      })
      syncedIds.push(row.id)
    } catch {
      /* ignore race */
    }
  }
  return { synced: syncedIds.length, syncedIds }
}

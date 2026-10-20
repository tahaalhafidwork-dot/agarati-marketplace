"use server"

import { revalidatePath } from "next/cache"

import { toggleFavoriteForUser } from "@/application/favorites/toggle"
import { requireSessionUser } from "@/lib/auth"
import { isDatabaseConfigured } from "@/lib/db"

export async function toggleFavoriteAction(
  listingId: string
): Promise<{ favorited?: boolean; error?: string; code?: string }> {
  if (!isDatabaseConfigured()) {
    return { error: "قاعدة البيانات غير مُعدّة.", code: "DB" }
  }

  let user
  try {
    user = await requireSessionUser()
  } catch {
    return { error: "يجب تسجيل الدخول.", code: "UNAUTHORIZED" }
  }

  const result = await toggleFavoriteForUser(user.id, listingId)
  if (result.error) return result

  revalidatePath("/dashboard/favorites")
  revalidatePath(`/properties/${listingId}`)
  revalidatePath("/properties")
  revalidatePath("/")
  return { favorited: result.favorited }
}

export async function syncGuestFavoritesAction(
  guestListingIds: string[]
): Promise<{ synced: number; syncedIds: string[]; error?: string }> {
  try {
    const user = await requireSessionUser()
    const { syncGuestFavoritesOnLogin } = await import(
      "@/application/favorites/toggle"
    )
    const result = await syncGuestFavoritesOnLogin(user.id, guestListingIds)
    if (result.synced > 0) {
      revalidatePath("/dashboard/favorites")
      revalidatePath("/properties")
      revalidatePath("/")
    }
    return result
  } catch {
    return { synced: 0, syncedIds: [], error: "UNAUTHORIZED" }
  }
}

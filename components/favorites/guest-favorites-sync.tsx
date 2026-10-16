"use client"

import { useEffect, useRef } from "react"

import { syncGuestFavoritesAction } from "@/lib/actions/listings"
import {
  getLocalFavoriteIds,
  removeLocalFavorite,
} from "@/lib/favorites-local"

/**
 * One-shot: after login, merge guest localStorage favorites that exist as
 * ACTIVE DB listings into Prisma. Demo / unknown IDs stay on-device.
 */
export function GuestFavoritesSync({ enabled }: { enabled: boolean }) {
  const ran = useRef(false)

  useEffect(() => {
    if (!enabled || ran.current) return
    ran.current = true
    const ids = getLocalFavoriteIds()
    if (!ids.length) return
    void (async () => {
      const result = await syncGuestFavoritesAction(ids)
      if (result.error) return
      for (const id of result.syncedIds ?? []) {
        removeLocalFavorite(id)
      }
    })()
  }, [enabled])

  return null
}

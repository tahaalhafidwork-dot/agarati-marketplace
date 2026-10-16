import {
  getLocalFavoriteIds,
  isLocalFavorite,
  clearLocalFavorites,
} from "@/lib/favorites-local"

export { isLocalFavorite, getLocalFavoriteIds }

/** Guest-only active check when no server favorited flag. */
export function resolveFavoriteActive(input: {
  favoritedFromServer: boolean
  isDemo: boolean
  listingId: string
  signedIn: boolean
}): boolean {
  if (input.favoritedFromServer) return true
  if (input.isDemo || !input.signedIn) {
    return isLocalFavorite(input.listingId)
  }
  // Authed + server false: do not treat leftover guest local as truth
  return false
}

export { clearLocalFavorites }

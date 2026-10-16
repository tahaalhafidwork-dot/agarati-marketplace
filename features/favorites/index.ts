/**
 * Favorites — P0 launch blocker.
 * Two kinds:
 * 1) Favorite — single listing (heart on detail)
 * 2) SavedSearch — current browse/filter list (bookmark on /properties)
 */
export const favoritesFeature = {
  name: "favorites",
  status: "implemented",
  kinds: ["listing", "savedSearch"] as const,
} as const

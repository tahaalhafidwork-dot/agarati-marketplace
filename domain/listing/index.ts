/**
 * Domain: listing browse rules (pure).
 * Keep I/O out of this folder — no Prisma, no fetch.
 */
export type { ListingQuery, SortKey } from "@/lib/listing-query"
export {
  buildPropertiesHref,
  countActiveFilters,
  parseListingQuery,
} from "@/lib/listing-query"
export {
  DEAL_OPTIONS,
  isDealAllowedForCategory,
  categoryAllowsDaily,
} from "@/lib/deals"
export {
  parseSearchIntent,
  matchesSmartSearch,
  type SearchIntent,
} from "@/lib/search"

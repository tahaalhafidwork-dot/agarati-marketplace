/**
 * Data-access layer for Home / Browse / Property / Favorites (M1 foundation).
 * Screens are not implemented yet — this module is the only place product data
 * should be fetched from once those routes land.
 */

import {
  fetchMobileFavorites,
  fetchMobileHealth,
  fetchMobileHomeCategories,
  fetchMobileListing,
  fetchMobileListings,
  toggleMobileFavorite,
  type MobileCategoryRow,
  type MobileHealthResponse,
} from "../lib/api"
import { createMobileSupabase } from "../lib/supabase"
import type {
  MobileListingCard,
  MobileListingsQuery,
  MobileListingsResponse,
  MobilePropertyCategory,
} from "../lib/types"

export type DataAccessContext = {
  /** Supabase access token for protected mobile adapters. */
  accessToken?: string | null
  signal?: AbortSignal
}

async function resolveAccessToken(
  explicit?: string | null
): Promise<string | null> {
  if (explicit) return explicit
  const client = createMobileSupabase()
  if (!client) return null
  const { data } = await client.auth.getSession()
  return data.session?.access_token ?? null
}

export const listingsAccess = {
  async list(
    query: MobileListingsQuery = {},
    ctx: DataAccessContext = {}
  ): Promise<MobileListingsResponse> {
    const token = await resolveAccessToken(ctx.accessToken)
    return fetchMobileListings(query, { signal: ctx.signal, token })
  },

  async getById(
    idOrSlug: string,
    ctx: DataAccessContext = {}
  ): Promise<MobileListingCard> {
    const token = await resolveAccessToken(ctx.accessToken)
    return fetchMobileListing(idOrSlug, { signal: ctx.signal, token })
  },
}

export const favoritesAccess = {
  async list(ctx: DataAccessContext = {}): Promise<MobileListingsResponse> {
    const token = await resolveAccessToken(ctx.accessToken)
    return fetchMobileFavorites({ signal: ctx.signal, token })
  },

  async toggle(
    listingId: string,
    ctx: DataAccessContext = {}
  ): Promise<{ favorited: boolean; listingId: string }> {
    const token = await resolveAccessToken(ctx.accessToken)
    return toggleMobileFavorite(listingId, { signal: ctx.signal, token })
  },
}

export const homeAccess = {
  /** Foundation probe — real health endpoint, no mocks. */
  async health(signal?: AbortSignal): Promise<MobileHealthResponse> {
    return fetchMobileHealth(signal)
  },

  async featured(
    ctx: DataAccessContext = {}
  ): Promise<MobileListingsResponse> {
    return listingsAccess.list({ sort: "newest", page: 1, pageSize: 6 }, ctx)
  },

  async categories(
    signal?: AbortSignal
  ): Promise<
    {
      category: MobilePropertyCategory
      label: string
      subtitle: string
      count: string
    }[]
  > {
    const res = await fetchMobileHomeCategories({ signal })
    return res.items.map((r: MobileCategoryRow) => ({
      category: r.category as MobilePropertyCategory,
      label: r.label,
      subtitle: r.subtitle,
      count: r.count,
    }))
  },
}

export const propertyAccess = {
  getById: listingsAccess.getById,
}

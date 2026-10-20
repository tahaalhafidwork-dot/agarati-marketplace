import Constants from "expo-constants"

import type {
  MobileApiErrorBody,
  MobileFavoriteToggleResponse,
  MobileListingCard,
  MobileListingsQuery,
  MobileListingsResponse,
} from "./types"

/**
 * Backend base URL for thin mobile adapters on the Next.js app.
 * Dev default: machine loopback — override with EXPO_PUBLIC_API_BASE_URL.
 * On a physical device, set the LAN IP (e.g. http://192.168.1.71:3000).
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, "")

  const hostUri = Constants.expoConfig?.hostUri
  if (hostUri) {
    const host = hostUri.split(":")[0]
    if (host && host !== "127.0.0.1" && host !== "localhost") {
      return `http://${host}:3000`
    }
  }

  return "http://127.0.0.1:3000"
}

export type MobileHealthResponse = {
  ok: boolean
  service: string
  phase: string
  timestamp: string
  checks: {
    supabaseConfigured: boolean
    databaseConfigured: boolean
  }
}

export class MobileApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = "MobileApiError"
    this.status = status
    this.code = code
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  token?: string | null
  body?: unknown
  signal?: AbortSignal
  query?: Record<string, string | number | boolean | undefined | null>
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const base = getApiBaseUrl()
  const url = new URL(
    path.startsWith("/") ? path : `/${path}`,
    base.endsWith("/") ? base : `${base}/`
  )
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

/**
 * Typed JSON client for `/api/mobile/*` adapters.
 * Does not call Server Actions. Auth = Bearer Supabase access token when needed.
 */
export async function mobileRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json"
  }

  const res = await fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  if (!res.ok) {
    let message = `mobile API HTTP ${res.status}`
    let code: string | undefined
    try {
      const err = (await res.json()) as MobileApiErrorBody
      if (err?.error) message = err.error
      code = err?.code
    } catch {
      /* ignore non-JSON */
    }
    throw new MobileApiError(res.status, message, code)
  }

  if (res.status === 204) {
    return undefined as T
  }
  return (await res.json()) as T
}

export async function fetchMobileHealth(
  signal?: AbortSignal
): Promise<MobileHealthResponse> {
  return mobileRequest<MobileHealthResponse>("/api/mobile/health", { signal })
}

/** Planned M1 browse adapter — calls thin Route Handler when wired. */
export async function fetchMobileListings(
  query: MobileListingsQuery = {},
  opts?: { signal?: AbortSignal; token?: string | null }
): Promise<MobileListingsResponse> {
  return mobileRequest<MobileListingsResponse>("/api/mobile/v1/listings", {
    query: {
      q: query.q,
      deal: query.deal,
      // Web `/properties` uses `type` for category
      type: query.category,
      city: query.city,
      district: query.district,
      neighborhood: query.neighborhood,
      complex: query.complex,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    },
    signal: opts?.signal,
    token: opts?.token,
  })
}

export async function fetchMobileListing(
  idOrSlug: string,
  opts?: { signal?: AbortSignal; token?: string | null }
): Promise<MobileListingCard> {
  return mobileRequest<MobileListingCard>(
    `/api/mobile/v1/listings/${encodeURIComponent(idOrSlug)}`,
    { signal: opts?.signal, token: opts?.token }
  )
}

export async function fetchMobileFavorites(
  opts?: { signal?: AbortSignal; token?: string | null }
): Promise<MobileListingsResponse> {
  return mobileRequest<MobileListingsResponse>("/api/mobile/v1/favorites", {
    signal: opts?.signal,
    token: opts?.token,
  })
}

export async function toggleMobileFavorite(
  listingId: string,
  opts?: { signal?: AbortSignal; token?: string | null }
): Promise<MobileFavoriteToggleResponse> {
  return mobileRequest<MobileFavoriteToggleResponse>(
    `/api/mobile/v1/favorites/${encodeURIComponent(listingId)}/toggle`,
    {
      method: "POST",
      signal: opts?.signal,
      token: opts?.token,
    }
  )
}

export type MobileEnsureProfileResponse = {
  id: string
  email: string
  name: string
  phone: string | null
}

export async function ensureMobileProfile(
  body: {
    name?: string
    phone?: string | null
  } = {},
  opts?: { signal?: AbortSignal; token?: string | null }
): Promise<MobileEnsureProfileResponse> {
  return mobileRequest<MobileEnsureProfileResponse>(
    "/api/mobile/v1/auth/ensure-profile",
    {
      method: "POST",
      body,
      signal: opts?.signal,
      token: opts?.token,
    }
  )
}

export type MobileCategoryRow = {
  category: string
  label: string
  subtitle: string
  count: string
  href?: string
}

export async function fetchMobileHomeCategories(
  opts?: { signal?: AbortSignal }
): Promise<{ items: MobileCategoryRow[] }> {
  return mobileRequest<{ items: MobileCategoryRow[] }>(
    "/api/mobile/v1/home/categories",
    { signal: opts?.signal }
  )
}

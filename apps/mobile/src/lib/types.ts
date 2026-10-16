/**
 * Mobile DTO types aligned with web public listing cards.
 */

export type MobileDealType = "sale" | "rent" | "daily"
export type MobilePropertyCategory =
  | "apartment"
  | "house"
  | "villa"
  | "office"
  | "land"
  | "building"
  | "farm"

export type MobileLocationRef = {
  city: string
  district: string
  neighborhood: string
  complex?: string
  complexLabel?: string
  street?: string
  label: string
}

/** Mirrors web `PublicListingCard` fields the app will need. */
export type MobileListingCard = {
  id: string
  slug: string
  title: string
  area: string
  location: MobileLocationRef
  price: string
  meta: string
  rooms: string
  areaM2: string
  floor?: string
  deal: MobileDealType
  category: MobilePropertyCategory
  type: string
  date: string
  image: string
  images: string[]
  description: string
  heating?: string
  furnished?: string
  ownerPhone?: string | null
  ownerWhatsapp?: string | null
  ownerName?: string
  ownerSlug?: string
  ownerKind?: string
  isDemo?: boolean
  listingNumber: string
  contactMethod?: "WHATSAPP_PHONE" | "ALL" | "CHAT"
  mapLat?: number | null
  mapLng?: number | null
  services?: string[]
  /** Present when Bearer session is sent on detail/favorites. */
  favorited?: boolean
}

/** Query shape mirroring web `/properties` URL filters. */
export type MobileListingsQuery = {
  q?: string
  deal?: MobileDealType
  /** Web uses `type` query param for category */
  category?: MobilePropertyCategory
  city?: string
  district?: string
  neighborhood?: string
  complex?: string
  sort?: string
  page?: number
  pageSize?: number
}

export type MobileListingsResponse = {
  items: MobileListingCard[]
  page: number
  pageSize: number
  total?: number
}

export type MobileFavoriteToggleResponse = {
  favorited: boolean
  listingId: string
}

export type MobileApiErrorBody = {
  error: string
  code?: string
}

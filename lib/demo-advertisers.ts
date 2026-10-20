import type { PublicListingCard } from "@/lib/listings"
import { sampleListings } from "@/lib/sample-listings"
import { formatListingNumber } from "@/lib/search"

export type AdvertiserKind = "person" | "agency"

export type PublicAdvertiser = {
  slug: string
  name: string
  kind: AdvertiserKind
  isDemo: boolean
  /** Short line under the name */
  subtitle: string
}

/** Demo personal sellers and real-estate agencies. */
export const DEMO_ADVERTISERS: PublicAdvertiser[] = [
  {
    slug: "ahmed-kurdi",
    name: "أحمد الكردي",
    kind: "person",
    isDemo: true,
    subtitle: "حساب فردي",
  },
  {
    slug: "sara-mansouri",
    name: "سارة المنصوري",
    kind: "person",
    isDemo: true,
    subtitle: "حساب فردي",
  },
  {
    slug: "karim-basri",
    name: "كريم البصري",
    kind: "person",
    isDemo: true,
    subtitle: "حساب فردي",
  },
  {
    slug: "rafidayn-realty",
    name: "دار الرافدين للعقارات",
    kind: "agency",
    isDemo: true,
    subtitle: "وكالة عقارية",
  },
  {
    slug: "erbil-horizon",
    name: "أفق أربيل العقارية",
    kind: "agency",
    isDemo: true,
    subtitle: "وكالة عقارية",
  },
  {
    slug: "baghdad-estate-house",
    name: "بيت العقار بغداد",
    kind: "agency",
    isDemo: true,
    subtitle: "وكالة عقارية",
  },
]

const bySlug = new Map(DEMO_ADVERTISERS.map((a) => [a.slug, a]))

export function getDemoAdvertiser(slug: string): PublicAdvertiser | null {
  return bySlug.get(slug) ?? null
}

export function advertiserKindLabel(kind: AdvertiserKind): string {
  return kind === "agency" ? "وكالة عقارية" : "حساب فردي"
}

export function advertiserHref(slug: string): string {
  if (slug.startsWith("agency:")) {
    return `/agencies/${encodeURIComponent(slug.slice("agency:".length))}`
  }
  return `/advertisers/${encodeURIComponent(slug)}`
}

/** Stable demo advertiser for a sample listing slug. */
export function demoAdvertiserForListingSlug(listingSlug: string): PublicAdvertiser {
  let h = 0
  for (let i = 0; i < listingSlug.length; i++) {
    h = (h * 31 + listingSlug.charCodeAt(i)) >>> 0
  }
  return DEMO_ADVERTISERS[h % DEMO_ADVERTISERS.length]
}

export function userAdvertiserSlug(userId: string): string {
  return `u-${userId}`
}

export function parseUserAdvertiserSlug(slug: string): string | null {
  if (!slug.startsWith("u-")) return null
  const id = slug.slice(2)
  return id || null
}

export function enrichSampleCardOwner(
  card: Omit<PublicListingCard, "ownerSlug" | "ownerKind"> & {
    ownerSlug?: string
    ownerKind?: AdvertiserKind
  },
  listingSlug: string
): PublicListingCard {
  const adv = demoAdvertiserForListingSlug(listingSlug)
  return {
    ...card,
    ownerName: adv.name,
    ownerSlug: adv.slug,
    ownerKind: adv.kind,
    isDemo: true,
  }
}

/** All sample listing cards for one demo advertiser. */
export function sampleListingsForAdvertiser(
  advertiserSlug: string
): PublicListingCard[] {
  const adv = getDemoAdvertiser(advertiserSlug)
  if (!adv) return []
  return sampleListings
    .filter((item) => demoAdvertiserForListingSlug(item.slug).slug === advertiserSlug)
    .map((item) =>
      enrichSampleCardOwner(
        {
          ...item,
          id: item.slug,
          ownerPhone: "9647501234567",
          ownerWhatsapp: "9647501234567",
          listingNumber: formatListingNumber(item.listingNumber),
          contactMethod: "ALL",
          services: item.services ?? [],
        },
        item.slug
      )
    )
}

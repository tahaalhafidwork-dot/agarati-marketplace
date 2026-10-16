import type {
  DealType as PrismaDeal,
  Listing,
  ListingImage,
  PropertyCategory as PrismaCategory,
  User,
} from "@prisma/client"

import { formatShortArea, type LocationRef } from "@/lib/locations"
import { listingImagePublicUrl } from "@/lib/supabase/config"
import { telUrl, whatsappUrl } from "@/lib/phone"
import type { DealType, PropertyCategory } from "@/lib/sample-listings"
import { dealLabels } from "@/lib/sample-listings"
import type { AdvertiserKind } from "@/lib/demo-advertisers"
import { userAdvertiserSlug } from "@/lib/demo-advertisers"

export const categoryToPrisma: Record<PropertyCategory, PrismaCategory> = {
  apartment: "APARTMENT",
  house: "HOUSE",
  villa: "VILLA",
  office: "OFFICE",
  land: "LAND",
  building: "BUILDING",
  farm: "FARM",
}

export const prismaToCategory: Record<PrismaCategory, PropertyCategory> = {
  APARTMENT: "apartment",
  HOUSE: "house",
  VILLA: "villa",
  OFFICE: "office",
  LAND: "land",
  BUILDING: "building",
  FARM: "farm",
}

export const dealToPrisma: Record<DealType, PrismaDeal> = {
  sale: "SALE",
  rent: "RENT",
  daily: "DAILY",
}

export const prismaToDeal: Record<PrismaDeal, DealType> = {
  SALE: "sale",
  RENT: "rent",
  DAILY: "daily",
}

export type ListingWithRelations = Listing & {
  images: ListingImage[]
  owner?: Pick<User, "id" | "name" | "phone" | "whatsapp">
}

/** Card / list DTO compatible with existing UI components. */
export type PublicListingCard = {
  id: string
  slug: string
  title: string
  area: string
  location: LocationRef
  price: string
  meta: string
  rooms: string
  areaM2: string
  floor?: string
  deal: DealType
  category: PropertyCategory
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
  /** Public profile slug — /advertisers/[slug] */
  ownerSlug?: string
  ownerKind?: AdvertiserKind
  /** Sample/demo listing — not in Postgres */
  isDemo?: boolean
  /** Sequential listing number for search/share: 00001, 00043, etc. */
  listingNumber: string
  /** Preferred contact method: WHATSAPP_PHONE | ALL | CHAT */
  contactMethod?: "WHATSAPP_PHONE" | "ALL" | "CHAT"
  /** Approximate public map coordinates (privacy-fuzzed) */
  mapLat?: number | null
  mapLng?: number | null
  /** Amenities / nearby services chosen by the lister */
  services?: string[]
}

const categoryLabelAr: Record<PropertyCategory, string> = {
  apartment: "شقة",
  house: "منزل مستقل",
  villa: "فيلا",
  office: "مكتب تجاري",
  land: "قطعة أرض",
  building: "عمارة",
  farm: "مزرعة",
}

export function formatPriceIqd(priceIqd: number, deal: DealType): string {
  const formatted = priceIqd.toLocaleString("en-US").replace(/,/g, "٫")
  if (deal === "rent") return `${formatted} د.ع / شهر`
  if (deal === "daily") return `${formatted} د.ع / ليلة`
  return `${formatted} د.ع`
}

export function relativeDateAr(date: Date): string {
  const days = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (days <= 0) return "اليوم"
  if (days === 1) return "أمس"
  if (days === 2) return "منذ يومين"
  if (days < 7) return `منذ ${days} أيام`
  return `منذ ${Math.floor(days / 7)} أسبوع`
}

export function toPublicListingCard(
  listing: ListingWithRelations,
  opts?: { complexLabels?: Record<string, string> }
): PublicListingCard {
  const category = prismaToCategory[listing.category]
  const deal = prismaToDeal[listing.deal]
  const complexLabel =
    (listing.complexSlug
      ? opts?.complexLabels?.[listing.complexSlug]
      : undefined) ??
    listing.proposedComplexName ??
    undefined
  const location: LocationRef = {
    city: listing.citySlug,
    district: listing.districtSlug,
    neighborhood: listing.neighborhoodSlug,
    complex: listing.complexSlug ?? undefined,
    complexLabel: complexLabel ?? undefined,
    street: listing.streetPrivate?.trim() || undefined,
  }
  const imageUrls = listing.images
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => listingImagePublicUrl(img.storagePath))

  return {
    id: listing.id,
    slug: listing.id,
    title: listing.title,
    area: formatShortArea(location),
    location,
    price: formatPriceIqd(listing.priceIqd, deal),
    meta:
      listing.meta ||
      [listing.rooms, listing.areaM2 ? `${listing.areaM2} م²` : null, listing.floor]
        .filter(Boolean)
        .join(" · "),
    rooms: listing.rooms ?? "—",
    areaM2: listing.areaM2 != null ? String(listing.areaM2) : "—",
    floor: listing.floor ?? undefined,
    deal,
    category,
    type: categoryLabelAr[category],
    date: relativeDateAr(listing.publishedAt ?? listing.createdAt),
    image: imageUrls[0] ?? "/placeholder-listing.svg",
    images: imageUrls,
    description: listing.description,
    heating: listing.heating ?? undefined,
    furnished: listing.furnished ?? undefined,
    ownerPhone: listing.owner?.phone,
    ownerWhatsapp: listing.owner?.whatsapp ?? listing.owner?.phone,
    ownerName: listing.owner?.name,
    ownerSlug: listing.owner?.id
      ? userAdvertiserSlug(listing.owner.id)
      : undefined,
    ownerKind: "person",
    isDemo: false,
    listingNumber: listing.listingNumber ?? listing.id.slice(-5).toUpperCase(),
    contactMethod: listing.contactMethod ?? undefined,
    mapLat: listing.mapLat ?? null,
    mapLng: listing.mapLng ?? null,
    services: listing.services ?? [],
  }
}

export function whatsappHref(phone: string, text?: string): string {
  return whatsappUrl(phone, text)
}

export function telHref(phone: string): string {
  return telUrl(phone)
}

export { dealLabels, categoryLabelAr }

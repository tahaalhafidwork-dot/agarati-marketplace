import type {
  DealType as PrismaDeal,
  Listing,
  ListingImage,
  PropertyCategory as PrismaCategory,
  User,
} from "@prisma/client"

import { formatShortArea, type LocationRef } from "@/lib/locations"
import { formatEnglishNumber, toEnglishDigits } from "@/lib/numerals"
import { listingImagePublicUrl } from "@/lib/supabase/config"
import { telUrl, whatsappUrl } from "@/lib/phone"
import type { DealType, PropertyCategory } from "@/lib/sample-listings"
import { dealLabels } from "@/lib/sample-listings"
import type { AdvertiserKind } from "@/lib/demo-advertisers"
import { userAdvertiserSlug } from "@/lib/demo-advertisers"
import {
  formatFloorNumber,
  formatPropertyFloors,
  inferLegacyFloorValues,
  parseLegacyRoomCount,
  toEnglishNumber,
} from "@/lib/listing-attributes"
import {
  classifyLandUse,
  parseLandUseMeta,
  type LandUse,
} from "@/lib/land-uses"

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
  roomCount?: number
  areaM2: string
  floor?: string
  floorNumber?: number
  propertyFloors?: number
  buildingFloors?: number
  deal: DealType
  category: PropertyCategory
  landUse?: LandUse
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
  const formatted = formatEnglishNumber(priceIqd)
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
  const landUse =
    category === "land"
      ? parseLandUseMeta(listing.meta) ??
        classifyLandUse(
          `${listing.title} ${listing.description} ${listing.meta ?? ""}`,
        )
      : undefined
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
    complexLabel: complexLabel ? toEnglishDigits(complexLabel) : undefined,
    street: listing.streetPrivate?.trim()
      ? toEnglishDigits(listing.streetPrivate.trim())
      : undefined,
  }
  const imageUrls = listing.images
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => listingImagePublicUrl(img.storagePath))
  const legacyFloors = inferLegacyFloorValues(category, listing.floor)
  const roomCount =
    listing.roomCount ?? parseLegacyRoomCount(listing.rooms) ?? undefined
  const floorNumber =
    listing.floorNumber ?? legacyFloors.floorNumber ?? undefined
  const propertyFloors =
    listing.propertyFloors ?? legacyFloors.propertyFloors ?? undefined
  const buildingFloors =
    listing.buildingFloors ?? legacyFloors.buildingFloors ?? undefined
  const rooms =
    roomCount != null
      ? toEnglishNumber(roomCount)
      : toEnglishDigits(listing.rooms ?? "—")
  const floor =
    floorNumber != null ? formatFloorNumber(floorNumber) : undefined
  const propertyFloorsMeta =
    propertyFloors != null && propertyFloors > 1
      ? formatPropertyFloors(propertyFloors, category)
      : null
  const structuredMeta = [
    roomCount != null
      ? `${toEnglishNumber(roomCount)} غرف`
      : listing.rooms
        ? toEnglishDigits(listing.rooms)
        : null,
    listing.areaM2 ? `${listing.areaM2} م²` : null,
    floor,
    propertyFloorsMeta,
  ]
    .filter(Boolean)
    .join(" · ")

  return {
    id: listing.id,
    slug: listing.id,
    title: toEnglishDigits(listing.title),
    area: toEnglishDigits(formatShortArea(location)),
    location,
    price: formatPriceIqd(listing.priceIqd, deal),
    meta: toEnglishDigits(structuredMeta || listing.meta || ""),
    rooms,
    roomCount,
    areaM2: listing.areaM2 != null ? String(listing.areaM2) : "—",
    floor,
    floorNumber,
    propertyFloors,
    buildingFloors,
    deal,
    category,
    landUse,
    type: categoryLabelAr[category],
    date: relativeDateAr(listing.publishedAt ?? listing.createdAt),
    image: imageUrls[0] ?? "/placeholder-listing.svg",
    images: imageUrls,
    description: toEnglishDigits(listing.description),
    heating: listing.heating ? toEnglishDigits(listing.heating) : undefined,
    furnished: listing.furnished
      ? toEnglishDigits(listing.furnished)
      : undefined,
    ownerPhone: listing.owner?.phone
      ? toEnglishDigits(listing.owner.phone)
      : listing.owner?.phone,
    ownerWhatsapp: listing.owner?.whatsapp
      ? toEnglishDigits(listing.owner.whatsapp)
      : listing.owner?.phone
        ? toEnglishDigits(listing.owner.phone)
        : listing.owner?.phone,
    ownerName: listing.owner?.name
      ? toEnglishDigits(listing.owner.name)
      : listing.owner?.name,
    ownerSlug: listing.owner?.id
      ? userAdvertiserSlug(listing.owner.id)
      : undefined,
    ownerKind: "person",
    isDemo: false,
    listingNumber: listing.listingNumber ?? listing.id.slice(-5).toUpperCase(),
    contactMethod: listing.contactMethod ?? undefined,
    mapLat: listing.mapLat ?? null,
    mapLng: listing.mapLng ?? null,
    services: (listing.services ?? []).map(toEnglishDigits),
  }
}

export function whatsappHref(phone: string, text?: string): string {
  return whatsappUrl(phone, text)
}

export function telHref(phone: string): string {
  return telUrl(phone)
}

export { dealLabels, categoryLabelAr }

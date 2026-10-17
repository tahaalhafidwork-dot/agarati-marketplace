import {
  cityOptions as locationCityOptions,
  complexesOf,
  districtsOf,
  formatPublicArea,
  getCity,
  iraqCities,
  neighborhoodsOf,
} from "@/lib/locations"
import { mergeComplexOptions } from "@/lib/complex-options"
import {
  categoryLabels,
  dealLabels,
  filterListings as filterByTypeDeal,
  isDealType,
  isPropertyCategory,
  sampleListings,
  toEnglishDigits,
  type DealType,
  type PropertyCategory,
  type SampleListing,
} from "@/lib/sample-listings"
import { matchesSmartSearch } from "@/lib/search"
import { CATEGORY_FIELD_FLAGS } from "@/lib/listing-form-config"
import {
  FLOOR_NUMBER_OPTIONS,
  PROPERTY_FLOOR_OPTIONS,
  inferLegacyFloorValues,
  parseIntegerOption,
  parseLegacyRoomCount,
  roomCountOptionsForCategory,
  toArabicNumber,
} from "@/lib/listing-attributes"

export type SortKey =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "area-asc"
  | "area-desc"

export type ListingQuery = {
  category?: PropertyCategory
  deal?: DealType
  /** City slug e.g. erbil */
  city?: string
  district?: string
  neighborhood?: string
  complex?: string
  rooms?: number
  floor?: number
  propertyFloors?: number
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  sort: SortKey
  /** Free-text search query */
  q?: string
}

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "newest", label: "الأحدث" },
  { value: "price-asc", label: "السعر: من الأقل للأعلى" },
  { value: "price-desc", label: "السعر: من الأعلى للأقل" },
  { value: "area-asc", label: "المساحة: من الأصغر" },
  { value: "area-desc", label: "المساحة: من الأكبر" },
]

export const filterFloorOptions = FLOOR_NUMBER_OPTIONS
export const filterPropertyFloorOptions = PROPERTY_FLOOR_OPTIONS

const DATE_RANK: Record<string, number> = {
  اليوم: 0,
  أمس: 1,
  "منذ يومين": 2,
  "منذ ٣ أيام": 3,
  "منذ ٤ أيام": 4,
  "منذ ٥ أيام": 5,
  "منذ أسبوع": 7,
}

export function fromArabicDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
}

export function parseIQD(value: string): number {
  const western = fromArabicDigits(value).replace(/[^\d]/g, "")
  return western ? Number(western) : 0
}

export function listingCity(listing: SampleListing): string {
  return getCity(listing.location.city)?.label ?? listing.area
}

export function listingPriceValue(listing: SampleListing): number {
  return parseIQD(listing.price)
}

export function listingAreaValue(listing: SampleListing): number {
  return parseIQD(listing.areaM2)
}

export function isSortKey(value: string): value is SortKey {
  return sortOptions.some((o) => o.value === value)
}

export function parseListingQuery(
  params: Record<string, string | string[] | undefined>
): ListingQuery {
  const get = (key: string) => {
    const v = params[key]
    return Array.isArray(v) ? v[0] : v
  }

  const type = get("type")
  const deal = get("deal")
  const city = get("city")
  const district = get("district")
  const neighborhood = get("neighborhood")
  const complex = get("complex")
  const roomsRaw = get("rooms")
  const floorRaw = get("floor")
  const propertyFloorsRaw = get("propertyFloors")
  const sortRaw = get("sort")
  const minPrice = get("minPrice")
  const maxPrice = get("maxPrice")
  const minArea = get("minArea")
  const maxArea = get("maxArea")
  const q = get("q")
  const category = type && isPropertyCategory(type) ? type : undefined
  const categoryFlags = category ? CATEGORY_FIELD_FLAGS[category] : undefined
  const roomOptions = roomCountOptionsForCategory(category ?? "")
  const legacyRoomCount = parseLegacyRoomCount(roomsRaw)
  const parsedRoomCount =
    parseIntegerOption(
      roomsRaw ? roomsRaw.split(",")[0] : null,
      roomOptions
    ) ??
    (legacyRoomCount != null && roomOptions.includes(legacyRoomCount)
      ? legacyRoomCount
      : undefined)

  return {
    category,
    deal: deal && isDealType(deal) ? deal : undefined,
    city: city?.trim() || undefined,
    district: district?.trim() || undefined,
    neighborhood: neighborhood?.trim() || undefined,
    complex: complex?.trim() || undefined,
    rooms: categoryFlags?.rooms ? parsedRoomCount : undefined,
    floor: categoryFlags?.floorNumber
      ? parseIntegerOption(floorRaw, FLOOR_NUMBER_OPTIONS) ?? undefined
      : undefined,
    propertyFloors: categoryFlags?.propertyFloors
      ? parseIntegerOption(propertyFloorsRaw, PROPERTY_FLOOR_OPTIONS) ??
        undefined
      : undefined,
    minPrice: minPrice
      ? Number(fromArabicDigits(minPrice)) || undefined
      : undefined,
    maxPrice: maxPrice
      ? Number(fromArabicDigits(maxPrice)) || undefined
      : undefined,
    minArea: minArea
      ? Number(fromArabicDigits(minArea)) || undefined
      : undefined,
    maxArea: maxArea
      ? Number(fromArabicDigits(maxArea)) || undefined
      : undefined,
    sort: sortRaw && isSortKey(sortRaw) ? sortRaw : "newest",
    q: q?.trim() || undefined,
  }
}

export function queryListings(query: ListingQuery): SampleListing[] {
  let items = filterByTypeDeal({
    category: query.category,
    deal: query.deal,
  })

  const searchQuery = query.q

  items = items.filter((item) => {
    const loc = item.location
    if (query.city && loc.city !== query.city) return false
    if (query.district && loc.district !== query.district) return false
    if (query.neighborhood && loc.neighborhood !== query.neighborhood) {
      return false
    }
    if (query.complex && loc.complex !== query.complex) return false

    const roomCount = item.roomCount ?? parseLegacyRoomCount(item.rooms)
    if (query.rooms != null && roomCount !== query.rooms) return false

    const legacyFloors = inferLegacyFloorValues(item.category, item.floor)
    const floorNumber = item.floorNumber ?? legacyFloors.floorNumber
    if (query.floor != null && floorNumber !== query.floor) return false

    const propertyFloors =
      item.propertyFloors ?? legacyFloors.propertyFloors
    if (
      query.propertyFloors != null &&
      propertyFloors !== query.propertyFloors
    ) {
      return false
    }

    const price = listingPriceValue(item)
    if (query.minPrice != null && price < query.minPrice) return false
    if (query.maxPrice != null && price > query.maxPrice) return false

    const area = listingAreaValue(item)
    if (query.minArea != null && area < query.minArea) return false
    if (query.maxArea != null && area > query.maxArea) return false

    if (!matchesSmartSearch(item, searchQuery)) return false

    return true
  })

  return sortListings(items, query.sort)
}

export function sortListings(
  items: SampleListing[],
  sort: SortKey
): SampleListing[] {
  const copy = [...items]
  copy.sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return listingPriceValue(a) - listingPriceValue(b)
      case "price-desc":
        return listingPriceValue(b) - listingPriceValue(a)
      case "area-asc":
        return listingAreaValue(a) - listingAreaValue(b)
      case "area-desc":
        return listingAreaValue(b) - listingAreaValue(a)
      case "newest":
      default: {
        const da = DATE_RANK[a.date] ?? 99
        const db = DATE_RANK[b.date] ?? 99
        return da - db
      }
    }
  })
  return copy
}

export function buildPropertiesHref(
  query: Partial<ListingQuery> & { sort?: SortKey; view?: "list" | "map" }
): string {
  const params = new URLSearchParams()
  if (query.category) params.set("type", query.category)
  if (query.deal) params.set("deal", query.deal)
  if (query.city) params.set("city", query.city)
  if (query.district) params.set("district", query.district)
  if (query.neighborhood) params.set("neighborhood", query.neighborhood)
  if (query.complex) params.set("complex", query.complex)
  if (query.rooms != null) params.set("rooms", String(query.rooms))
  if (query.floor != null) params.set("floor", String(query.floor))
  if (query.propertyFloors != null) {
    params.set("propertyFloors", String(query.propertyFloors))
  }
  if (query.minPrice != null) params.set("minPrice", String(query.minPrice))
  if (query.maxPrice != null) params.set("maxPrice", String(query.maxPrice))
  if (query.minArea != null) params.set("minArea", String(query.minArea))
  if (query.maxArea != null) params.set("maxArea", String(query.maxArea))
  if (query.sort && query.sort !== "newest") params.set("sort", query.sort)
  if (query.q) params.set("q", query.q)
  if (query.view === "map") params.set("view", "map")

  const qs = params.toString()
  return qs ? `/properties?${qs}` : "/properties"
}

export function countActiveFilters(query: ListingQuery): number {
  let n = 0
  if (query.deal) n += 1
  if (query.city) n += 1
  if (query.district) n += 1
  if (query.neighborhood) n += 1
  if (query.complex) n += 1
  if (query.rooms != null) n += 1
  if (query.floor != null) n += 1
  if (query.propertyFloors != null) n += 1
  if (query.minPrice != null || query.maxPrice != null) n += 1
  if (query.minArea != null || query.maxArea != null) n += 1
  if (query.q) n += 1
  return n
}

export function activeFilterChips(query: ListingQuery): {
  key: string
  label: string
  clearHref: string
}[] {
  const chips: { key: string; label: string; clearHref: string }[] = []

  const without = (patch: Partial<ListingQuery>) =>
    buildPropertiesHref({ ...query, ...patch })

  if (query.deal) {
    chips.push({
      key: "deal",
      label: dealLabels[query.deal],
      clearHref: without({ deal: undefined }),
    })
  }
  if (query.city) {
    chips.push({
      key: "city",
      label: getCity(query.city)?.label ?? query.city,
      clearHref: without({
        city: undefined,
        district: undefined,
        neighborhood: undefined,
        complex: undefined,
      }),
    })
  }
  if (query.district && query.city) {
    const d = districtsOf(query.city).find((x) => x.slug === query.district)
    chips.push({
      key: "district",
      label: d?.label ?? query.district,
      clearHref: without({
        district: undefined,
        neighborhood: undefined,
        complex: undefined,
      }),
    })
  }
  if (query.neighborhood && query.city && query.district) {
    const n = neighborhoodsOf(query.city, query.district).find(
      (x) => x.slug === query.neighborhood
    )
    chips.push({
      key: "neighborhood",
      label: n?.label ?? query.neighborhood,
      clearHref: without({ neighborhood: undefined, complex: undefined }),
    })
  }
  if (query.complex && query.city && query.district && query.neighborhood) {
    const c = complexesOf(
      query.city,
      query.district,
      query.neighborhood
    ).find((x) => x.slug === query.complex)
    chips.push({
      key: "complex",
      label: c?.label ?? query.complex,
      clearHref: without({ complex: undefined }),
    })
  }
  if (query.rooms != null) {
    chips.push({
      key: "rooms",
      label: `الغرف ${toArabicNumber(query.rooms)}`,
      clearHref: without({ rooms: undefined }),
    })
  }
  if (query.floor != null) {
    chips.push({
      key: "floor",
      label: `الطابق ${toArabicNumber(query.floor)}`,
      clearHref: without({ floor: undefined }),
    })
  }
  if (query.propertyFloors != null) {
    chips.push({
      key: "propertyFloors",
      label: `طوابق العقار ${toArabicNumber(query.propertyFloors)}`,
      clearHref: without({ propertyFloors: undefined }),
    })
  }
  if (query.minPrice != null || query.maxPrice != null) {
    const from = query.minPrice != null ? toEnglishDigits(query.minPrice) : "…"
    const to = query.maxPrice != null ? toEnglishDigits(query.maxPrice) : "…"
    chips.push({
      key: "price",
      label: `السعر ${from}–${to}`,
      clearHref: without({ minPrice: undefined, maxPrice: undefined }),
    })
  }
  if (query.minArea != null || query.maxArea != null) {
    const from = query.minArea != null ? toEnglishDigits(query.minArea) : "…"
    const to = query.maxArea != null ? toEnglishDigits(query.maxArea) : "…"
    chips.push({
      key: "area",
      label: `م² ${from}–${to}`,
      clearHref: without({ minArea: undefined, maxArea: undefined }),
    })
  }
  if (query.sort !== "newest") {
    const label =
      sortOptions.find((o) => o.value === query.sort)?.label ?? query.sort
    chips.push({
      key: "sort",
      label,
      clearHref: without({ sort: "newest" }),
    })
  }
  if (query.q) {
    chips.push({
      key: "q",
      label: `بحث: ${query.q}`,
      clearHref: without({ q: undefined }),
    })
  }

  return chips
}

export function availableCities() {
  return locationCityOptions()
}

export function availableDistricts(city?: string) {
  return city ? districtsOf(city) : []
}

export function availableNeighborhoods(city?: string, district?: string) {
  return city && district ? neighborhoodsOf(city, district) : []
}

export function availableComplexes(
  city?: string,
  district?: string,
  neighborhood?: string,
  catalogProjects?: Array<{
    slug: string
    name: string
    citySlug: string | null
    districtSlug: string | null
    neighborhoodSlug: string | null
  }>
) {
  if (catalogProjects) {
    return mergeComplexOptions(
      catalogProjects,
      city,
      district,
      neighborhood
    ).map((c) => ({ slug: c.slug, label: c.label }))
  }
  return city && district && neighborhood
    ? complexesOf(city, district, neighborhood)
    : []
}

export function categoryTitlePart(category?: PropertyCategory): string {
  return category ? categoryLabels[category] : "العقارات"
}

export function sortLabel(sort: SortKey): string {
  return sortOptions.find((o) => o.value === sort)?.label ?? "الأحدث"
}

export { districtsOf, iraqCities, neighborhoodsOf, formatPublicArea, sampleListings }

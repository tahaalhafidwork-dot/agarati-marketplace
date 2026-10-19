import { listApprovedProjectsForComplexes } from "@/lib/complex-options"
import { PAGE_SIZE } from "@/lib/constants"
import { isDatabaseReachable, prisma } from "@/lib/db"
import { LAND_USE_LABELS } from "@/lib/land-uses"
import {
  parseListingQuery,
  sortLabel,
  districtsOf,
  neighborhoodsOf,
  iraqCities,
  countActiveFilters,
  buildPropertiesHref,
  type ListingQuery,
} from "@/lib/listing-query"
import { fetchPublicListings } from "@/lib/listing-service"
import {
  categoryLabels,
  categorySlugs,
  dealLabels,
  listingsPageTitle,
} from "@/lib/sample-listings"
import { searchEmptyMessage } from "@/lib/search"
import {
  pointFromStoredCoords,
  resolveApproximateMapPoint,
} from "@/lib/map-geo"
import { formatPublicArea } from "@/lib/locations"
import { savedSearchQueryKey } from "@/lib/saved-search"
import type { ApproximateMapPoint } from "@/lib/map-geo"
import type { PublicListingCard } from "@/lib/listings"

export type BrowseMapListing = {
  id: string
  href: string
  title: string
  price: string
  area: string
  type: PublicListingCard["type"]
  deal: PublicListingCard["deal"]
  image: string
  listingNumber: string
  point: ApproximateMapPoint
}

export type BrowsePageModel = {
  query: ListingQuery
  mapView: boolean
  listings: PublicListingCard[]
  mapListings: BrowseMapListing[]
  title: string
  description: string
  countLabel: string
  backHref: string
  typeLabel: string
  dealLabel: string | null
  activeCount: number
  clearHref: string
  listHref: string
  mapHref: string
  saveHref: string
  initialSaved: boolean
  sessionPresent: boolean
  showMapFab: boolean
  emptyMessage: string
  sortLabelText: string
  pageSize: number
  catalogProjects: Array<{
    slug: string
    name: string
    citySlug: string | null
    districtSlug: string | null
    neighborhoodSlug: string | null
  }>
}

type SearchParamsRecord = Record<string, string | string[] | undefined>

function browseTitle(query: ListingQuery): string {
  if (query.category === "land" && query.landUse) {
    const deal = query.deal ? ` ${dealLabels[query.deal]}` : ""
    return `${LAND_USE_LABELS[query.landUse]}${deal}`
  }
  return listingsPageTitle(query)
}

export function buildPropertiesBrowseMetadata(sp: SearchParamsRecord): {
  title: string
  description: string
} {
  const query = parseListingQuery(sp)
  const title = browseTitle(query)

  const parts: string[] = []
  if (query.category) parts.push(categoryLabels[query.category])
  if (query.deal) parts.push(dealLabels[query.deal])
  if (query.landUse) parts.push(LAND_USE_LABELS[query.landUse])
  if (query.city) {
    const city = iraqCities.find((c) => c.slug === query.city)
    if (city) parts.push(city.label)
  }
  if (query.district && query.city) {
    const district = districtsOf(query.city).find(
      (d) => d.slug === query.district
    )
    if (district) parts.push(district.label)
  }
  if (query.neighborhood && query.city && query.district) {
    const neighborhood = neighborhoodsOf(query.city, query.district).find(
      (n) => n.slug === query.neighborhood
    )
    if (neighborhood) parts.push(neighborhood.label)
  }

  const description = parts.length
    ? `تصفح إعلانات ${parts.join(" · ")} في أغاراتي — عقارات للبيع والإيجار`
    : "تصفح جميع العقارات المعروضة للبيع والإيجار في أغاراتي — سوق عقاري عربي"

  return { title, description }
}

export async function loadPropertiesBrowsePage(input: {
  searchParams: SearchParamsRecord
  userId: string | null
}): Promise<BrowsePageModel> {
  const sp = input.searchParams
  const query = parseListingQuery(sp)
  const viewRaw = Array.isArray(sp.view) ? sp.view[0] : sp.view
  const mapView = viewRaw === "map"
  const [listings, approvedProjects] = await Promise.all([
    fetchPublicListings(query),
    listApprovedProjectsForComplexes(300),
  ])
  const title = browseTitle(query)
  const countLabel = String(listings.length)
  const backHref =
    query.category === "land" && query.deal && query.landUse
      ? `/categories/lands/${query.deal}`
      : query.category
        ? `/categories/${categorySlugs[query.category]}`
        : "/categories"

  const typeLabel = query.category
    ? categoryLabels[query.category]
    : "العقارات"
  const dealLabel = query.deal ? dealLabels[query.deal] : null
  const activeCount = countActiveFilters(query)
  const clearHref = buildPropertiesHref({
    category: query.category,
    sort: query.sort,
  })
  const listHref = buildPropertiesHref({ ...query, view: "list" })
  const mapHref = buildPropertiesHref({ ...query, view: "map" })
  const saveHref = buildPropertiesHref({ ...query })
  const queryKey = savedSearchQueryKey(saveHref)
  const initialSaved =
    input.userId && (await isDatabaseReachable())
      ? Boolean(
          await prisma.savedSearch.findUnique({
            where: {
              userId_queryKey: { userId: input.userId, queryKey },
            },
            select: { id: true },
          })
        )
      : false

  const mapListings: BrowseMapListing[] = listings.map((item) => {
    const point =
      pointFromStoredCoords(item.mapLat, item.mapLng, {
        label: formatPublicArea(item.location),
      }) ??
      resolveApproximateMapPoint(item.location, {
        seed: item.id,
        label: formatPublicArea(item.location),
      })
    return {
      id: item.id,
      href: `/properties/${item.id}`,
      title: item.title,
      price: item.price,
      area: item.area,
      type: item.type,
      deal: item.deal,
      image: item.image,
      listingNumber: item.listingNumber ?? "",
      point: point!,
    }
  })

  const { description } = buildPropertiesBrowseMetadata(sp)

  const rangeNotes: string[] = []
  if (
    query.minPrice != null &&
    query.maxPrice != null &&
    query.minPrice > query.maxPrice
  ) {
    rangeNotes.push("الحد الأدنى للسعر أكبر من الحد الأعلى.")
  }
  if (
    query.minArea != null &&
    query.maxArea != null &&
    query.minArea > query.maxArea
  ) {
    rangeNotes.push("الحد الأدنى للمساحة أكبر من الحد الأعلى.")
  }
  const emptyMessage = rangeNotes.length
    ? `${rangeNotes.join(" ")} عدّل المدى لعرض النتائج.`
    : searchEmptyMessage(query.q)


  return {
    query,
    mapView,
    listings,
    mapListings,
    title,
    description,
    countLabel,
    backHref,
    typeLabel,
    dealLabel,
    activeCount,
    clearHref,
    listHref,
    mapHref,
    saveHref,
    initialSaved,
    sessionPresent: Boolean(input.userId),
    showMapFab: Boolean(query.category) && listings.length > 0,
    emptyMessage,
    sortLabelText: sortLabel(query.sort),
    pageSize: PAGE_SIZE,
    catalogProjects: approvedProjects.map((p) => ({
      slug: p.slug,
      name: p.name,
      citySlug: p.citySlug,
      districtSlug: p.districtSlug,
      neighborhoodSlug: p.neighborhoodSlug,
    })),
  }
}

import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/db"
import { publicListingVisibilityWhere } from "@/lib/listing-quota"
import { categoryToPrisma, dealToPrisma, toPublicListingCard, type PublicListingCard } from "@/lib/listings"
import { encodeLandUseMeta, LAND_USE_SEARCH_TERMS, type LandUse } from "@/lib/land-uses"
import { SUGGESTED_LISTING_SERVICES } from "@/lib/listing-services"
import { RESIDENTIAL_PROJECT_KINDS } from "@/lib/project-kinds"
import { formatPublicArea, formatShortArea } from "@/lib/locations"
import { pointFromStoredCoords, resolveApproximateMapPoint, type ApproximateMapPoint } from "@/lib/map-geo"
import type { AgarlyFilters } from "@/lib/agarly/schema"
import { isMoreThanThreePropertyFloors } from "@/lib/listing-attributes"

export type AgarlyMapListing = {
  id: string
  href: string
  title: string
  price: string
  area: string
  type: string
  deal: PublicListingCard["deal"]
  image: string
  listingNumber: string
  rooms?: string | null
  point: ApproximateMapPoint
}

export type AgarlyProjectResult = {
  id: string
  slug: string
  name: string
  summary: string | null
  imageUrl: string | null
  locationLabel: string
}

export type AgarlyAgencyResult = {
  id: string
  slug: string
  name: string
  bio: string | null
  logoUrl: string | null
  locationLabel: string
}

export type AgarlySearchResults = {
  listings: PublicListingCard[]
  mapListings: AgarlyMapListing[]
  projects: AgarlyProjectResult[]
  agencies: AgarlyAgencyResult[]
  counts: { listings: number; projects: number; agencies: number }
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
}

function resolveServices(services: string[]): string[] {
  return services
    .map((requested) => {
      const key = normalize(requested)
      return SUGGESTED_LISTING_SERVICES.find((candidate) => {
        const candidateKey = normalize(candidate)
        return candidateKey === key || candidateKey.includes(key) || key.includes(candidateKey)
      })
    })
    .filter((value): value is (typeof SUGGESTED_LISTING_SERVICES)[number] => Boolean(value))
}

function appendAnd(where: Prisma.ListingWhereInput, clause: Prisma.ListingWhereInput) {
  const current = where.AND
  where.AND = [...(Array.isArray(current) ? current : current ? [current] : []), clause]
}

export function buildAgarlyListingWhere(
  filters: AgarlyFilters,
  projectSlugs: string[] | null = null,
): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = { ...publicListingVisibilityWhere() }
  if (filters.category) where.category = categoryToPrisma[filters.category]
  if (filters.deal) where.deal = dealToPrisma[filters.deal]
  if (filters.city) where.citySlug = filters.city
  if (filters.district) where.districtSlug = filters.district
  if (filters.neighborhood) where.neighborhoodSlug = filters.neighborhood
  if (filters.rooms != null) where.roomCount = filters.rooms
  if (filters.propertyFloors != null) {
    where.propertyFloors = isMoreThanThreePropertyFloors(
      filters.category ?? undefined,
      filters.propertyFloors,
    )
      ? { gte: 4 }
      : filters.propertyFloors
  }
  if (filters.minPriceIqd != null || filters.maxPriceIqd != null) {
    where.priceIqd = {
      ...(filters.minPriceIqd != null ? { gte: filters.minPriceIqd } : {}),
      ...(filters.maxPriceIqd != null ? { lte: filters.maxPriceIqd } : {}),
    }
  }
  if (filters.minAreaM2 != null || filters.maxAreaM2 != null) {
    where.areaM2 = {
      ...(filters.minAreaM2 != null ? { gte: filters.minAreaM2 } : {}),
      ...(filters.maxAreaM2 != null ? { lte: filters.maxAreaM2 } : {}),
    }
  }
  if (filters.insideComplex) where.complexSlug = { not: null }
  if (projectSlugs) where.complexSlug = { in: projectSlugs }
  if (filters.approvedAgencyOnly) where.agency = { status: "APPROVED" }

  if (filters.landUse) {
    const use = filters.landUse as LandUse
    appendAnd(where, {
      OR: [
        { meta: encodeLandUseMeta(use) },
        ...LAND_USE_SEARCH_TERMS[use].flatMap((term) => [
          { title: { contains: term, mode: "insensitive" as const } },
          { description: { contains: term, mode: "insensitive" as const } },
        ]),
      ],
    })
  }

  const knownServices = resolveServices(filters.services)
  if (knownServices.length) where.services = { hasEvery: knownServices }

  for (const keyword of filters.keywords) {
    appendAnd(where, {
      OR: [
        { title: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
        { meta: { contains: keyword, mode: "insensitive" } },
      ],
    })
  }
  return where
}

function listingOrderBy(sort: AgarlyFilters["sort"]): Prisma.ListingOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc": return [{ priceIqd: "asc" }]
    case "price-desc": return [{ priceIqd: "desc" }]
    case "area-asc": return [{ areaM2: "asc" }]
    case "area-desc": return [{ areaM2: "desc" }]
    default: return [{ publishedAt: "desc" }, { createdAt: "desc" }]
  }
}

function locationLabel(value: {
  citySlug: string | null
  districtSlug: string | null
  neighborhoodSlug: string | null
}): string {
  if (!value.citySlug) return "العراق"
  const ref = {
    city: value.citySlug,
    district: value.districtSlug ?? "",
    neighborhood: value.neighborhoodSlug ?? "",
  }
  return formatShortArea(ref) || formatPublicArea(ref) || "العراق"
}

export function buildAgarlyProjectWhere(filters: AgarlyFilters): Prisma.ProjectWhereInput {
  return {
    status: "APPROVED",
    projectKind: { in: RESIDENTIAL_PROJECT_KINDS },
    ...(filters.city ? { citySlug: filters.city } : {}),
    ...(filters.district ? { districtSlug: filters.district } : {}),
    ...(filters.neighborhood ? { neighborhoodSlug: filters.neighborhood } : {}),
    ...(filters.projectQuery
      ? {
          OR: [
            { name: { contains: filters.projectQuery, mode: "insensitive" as const } },
            { slug: { contains: filters.projectQuery, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }
}

export function buildAgarlyAgencyWhere(
  filters: AgarlyFilters,
  projectSlugs: string[] | null,
): Prisma.AgencyWhereInput {
  return {
    status: "APPROVED",
    ...(filters.city ? { citySlug: filters.city } : {}),
    ...(filters.district ? { districtSlug: filters.district } : {}),
    ...(filters.neighborhood ? { neighborhoodSlug: filters.neighborhood } : {}),
    ...(filters.agencyQuery
      ? {
          OR: [
            { name: { contains: filters.agencyQuery, mode: "insensitive" as const } },
            { bio: { contains: filters.agencyQuery, mode: "insensitive" as const } },
            { addressLine: { contains: filters.agencyQuery, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(projectSlugs
      ? projectSlugs.length
        ? {
            createdBy: {
              agencyProjects: { some: { project: { slug: { in: projectSlugs } } } },
            },
          }
        : { id: { in: [] } }
      : {}),
  }
}

export async function searchAgarly(filters: AgarlyFilters): Promise<AgarlySearchResults> {
  const projectWhere = buildAgarlyProjectWhere(filters)

  const matchedProjects = await prisma.project.findMany({
    where: projectWhere,
    orderBy: { name: "asc" },
    take: 6,
    select: {
      id: true,
      slug: true,
      name: true,
      summary: true,
      imageUrl: true,
      imageUrls: true,
      citySlug: true,
      districtSlug: true,
      neighborhoodSlug: true,
    },
  })

  const projectSlugs = filters.projectQuery ? matchedProjects.map((project) => project.slug) : null
  const shouldListListings = filters.intent !== "projects" && filters.intent !== "agencies"
  const shouldListProjects = filters.intent === "projects" || filters.intent === "mixed"
  const shouldListAgencies = filters.intent === "agencies" || filters.intent === "mixed"

  const [listingRows, agencyRows] = await Promise.all([
    shouldListListings
      ? prisma.listing.findMany({
          where: buildAgarlyListingWhere(filters, projectSlugs),
          orderBy: listingOrderBy(filters.sort),
          take: 12,
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            owner: { select: { id: true, name: true, phone: true, whatsapp: true } },
            agency: {
              select: { slug: true, name: true, phone: true, whatsapp: true, createdById: true },
            },
            assignedAgent: { select: { id: true, name: true } },
          },
        })
      : Promise.resolve([]),
    shouldListAgencies
      ? prisma.agency.findMany({
          where: buildAgarlyAgencyWhere(filters, projectSlugs),
          orderBy: { name: "asc" },
          take: 6,
          select: {
            id: true,
            slug: true,
            name: true,
            bio: true,
            logoUrl: true,
            citySlug: true,
            districtSlug: true,
            neighborhoodSlug: true,
          },
        })
      : Promise.resolve([]),
  ])

  const listings = listingRows.map((row) => toPublicListingCard(row))
  const mapListings = listings.map((item) => {
    const point =
      pointFromStoredCoords(item.mapLat, item.mapLng, { label: formatPublicArea(item.location) }) ??
      resolveApproximateMapPoint(item.location, { seed: item.id, label: formatPublicArea(item.location) })
    return {
      id: item.id,
      href: `/properties/${item.id}`,
      title: item.title,
      price: item.price,
      area: item.area,
      type: item.type,
      deal: item.deal,
      image: item.image,
      listingNumber: item.listingNumber,
      rooms: item.rooms,
      point: point!,
    }
  })

  const projects = shouldListProjects
    ? matchedProjects.map((project) => ({
        id: project.id,
        slug: project.slug,
        name: project.name,
        summary: project.summary,
        imageUrl: project.imageUrl ?? project.imageUrls[0] ?? null,
        locationLabel: locationLabel(project),
      }))
    : []
  const agencies = agencyRows.map((agency) => ({
    id: agency.id,
    slug: agency.slug,
    name: agency.name,
    bio: agency.bio,
    logoUrl: agency.logoUrl,
    locationLabel: locationLabel(agency),
  }))

  return {
    listings,
    mapListings,
    projects,
    agencies,
    counts: { listings: listings.length, projects: projects.length, agencies: agencies.length },
  }
}

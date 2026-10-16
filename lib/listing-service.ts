import { cache } from "react"
import type {
  Prisma,
} from "@prisma/client"

import { PAGE_SIZE } from "@/lib/constants"
import { isDatabaseConfigured, isDatabaseReachable, prisma } from "@/lib/db"
import { queryListings, type ListingQuery } from "@/lib/listing-query"
import {
  expireOverdueListings,
  publicListingVisibilityWhere,
} from "@/lib/listing-quota"
import {
  categoryToPrisma,
  dealToPrisma,
  prismaToCategory,
  prismaToDeal,
  toPublicListingCard,
  type PublicListingCard,
} from "@/lib/listings"

async function complexLabelsForRows(
  rows: { complexSlug: string | null }[]
): Promise<Record<string, string>> {
  const slugs = [
    ...new Set(
      rows.map((r) => r.complexSlug).filter((s): s is string => Boolean(s))
    ),
  ]
  if (slugs.length === 0) return {}
  try {
    const projects = await prisma.project.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true, name: true },
    })
    return Object.fromEntries(projects.map((p) => [p.slug, p.name]))
  } catch {
    return {}
  }
}
import { sampleListings, type DealType, type PropertyCategory } from "@/lib/sample-listings"
import {
  enrichSampleCardOwner,
  getDemoAdvertiser,
  parseUserAdvertiserSlug,
  sampleListingsForAdvertiser,
  type PublicAdvertiser,
} from "@/lib/demo-advertisers"
import {
  formatListingNumber,
  listingNumberMatches,
  matchesSmartSearch,
  parseSearchIntent,
} from "@/lib/search"

function sampleCardsForQuery(query: ListingQuery): PublicListingCard[] {
  return queryListings(query).map((item) =>
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

/**
 * Prefer live DB rows. When the marketplace has zero matching ACTIVE ads,
 * fall back to labeled sample cards so the public UI is not empty.
 * Never pad a non-empty DB result page with samples.
 */
function sampleFallback(
  dbRows: PublicListingCard[],
  query: ListingQuery,
  limit: number
): PublicListingCard[] {
  if (dbRows.length > 0) return dbRows.slice(0, limit)
  return sampleCardsForQuery(query).slice(0, limit)
}

async function liveMarketplaceHasListings(): Promise<boolean> {
  const n = await prisma.listing.count({
    where: publicListingVisibilityWhere(),
  })
  return n > 0
}

/**
 * Count uses the same filters as the card query.
 * Sample counts are only a stand-in when the live marketplace is empty.
 */
export async function countPublicListings(query: ListingQuery): Promise<number> {
  const sampleCount = sampleCardsForQuery(query).length
  if (!isDatabaseConfigured() || !(await isDatabaseReachable())) {
    return sampleCount
  }
  try {
    await expireOverdueListings()
    const dbCount = await prisma.listing.count({
      where: buildListingWhere(query),
    })
    if (dbCount > 0) return dbCount
    if (await liveMarketplaceHasListings()) return 0
    return sampleCount
  } catch {
    return sampleCount
  }
}

/**
 * Prefetch category/deal counts in one pass for taxonomy + home menu.
 * Keys: `all`, `category`, `category:deal`
 * Cached per request so home + categories share one index.
 */
export const getPublicListingCountIndex = cache(async (): Promise<
  Record<string, number>
> => {
  const categories = Object.keys(categoryToPrisma) as PropertyCategory[]
  const deals = Object.keys(dealToPrisma) as DealType[]

  const sampleIndex: Record<string, number> = { all: sampleListings.length }
  for (const category of categories) {
    const inCat = sampleListings.filter((i) => i.category === category)
    sampleIndex[category] = inCat.length
    for (const deal of deals) {
      sampleIndex[`${category}:${deal}`] = inCat.filter(
        (i) => i.deal === deal
      ).length
    }
  }

  if (!isDatabaseConfigured() || !(await isDatabaseReachable())) {
    return sampleIndex
  }

  try {
    await expireOverdueListings()
    const groups = await prisma.listing.groupBy({
      by: ["category", "deal"],
      where: publicListingVisibilityWhere(),
      _count: { _all: true },
    })

    if (groups.length === 0) return sampleIndex

    const index: Record<string, number> = { all: 0 }
    for (const category of categories) {
      index[category] = 0
      for (const deal of deals) {
        index[`${category}:${deal}`] = 0
      }
    }

    for (const row of groups) {
      const category = prismaToCategory[row.category]
      const deal = prismaToDeal[row.deal]
      const n = row._count._all
      if (category) {
        index[category] = (index[category] ?? 0) + n
        if (deal) {
          index[`${category}:${deal}`] = (index[`${category}:${deal}`] ?? 0) + n
        }
      }
    }

    // A live marketplace must not borrow sample counts for empty categories.
    index.all = categories.reduce(
      (sum, category) => sum + (index[category] ?? 0),
      0
    )

    return index.all > 0 ? index : sampleIndex
  } catch {
    return sampleIndex
  }
})

export function countFromIndex(
  index: Record<string, number>,
  opts?: { category?: PropertyCategory; deal?: DealType }
): number {
  if (opts?.category && opts?.deal) {
    return index[`${opts.category}:${opts.deal}`] ?? 0
  }
  if (opts?.category) return index[opts.category] ?? 0
  return index.all ?? 0
}

function buildListingWhere(query: ListingQuery): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = {
    ...publicListingVisibilityWhere(),
  }

  if (query.category) {
    where.category = categoryToPrisma[query.category]
  }
  if (query.deal) {
    where.deal = dealToPrisma[query.deal]
  }
  if (query.city) where.citySlug = query.city
  if (query.district) where.districtSlug = query.district
  if (query.neighborhood) where.neighborhoodSlug = query.neighborhood
  if (query.complex) where.complexSlug = query.complex
  if (query.rooms?.length) {
    where.rooms = { in: query.rooms }
  }
  if (query.minPrice != null || query.maxPrice != null) {
    where.priceIqd = {}
    if (query.minPrice != null) where.priceIqd.gte = query.minPrice
    if (query.maxPrice != null) where.priceIqd.lte = query.maxPrice
  }
  if (query.minArea != null || query.maxArea != null) {
    where.areaM2 = {}
    if (query.minArea != null) where.areaM2.gte = query.minArea
    if (query.maxArea != null) where.areaM2.lte = query.maxArea
  }

  const intent = parseSearchIntent(query.q)
  if (intent?.kind === "title") {
    where.title = { contains: intent.text, mode: "insensitive" }
  } else if (intent?.kind === "listingNumber") {
    // Prefer SQL equality / contains; numeric pad equivalence post-filtered below.
    const digits = intent.code.replace(/\D/g, "")
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      {
        OR: [
          { listingNumber: { equals: intent.code, mode: "insensitive" } },
          ...(digits
            ? [{ listingNumber: { contains: digits, mode: "insensitive" as const } }]
            : []),
        ],
      },
    ]
  }

  return where
}

function orderByForQuery(
  sort: ListingQuery["sort"]
): Prisma.ListingOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ priceIqd: "asc" }]
    case "price-desc":
      return [{ priceIqd: "desc" }]
    case "area-asc":
      return [{ areaM2: "asc" }]
    case "area-desc":
      return [{ areaM2: "desc" }]
    default:
      return [{ publishedAt: "desc" }, { createdAt: "desc" }]
  }
}

export async function fetchPublicListings(
  query: ListingQuery,
  opts?: { take?: number }
): Promise<PublicListingCard[]> {
  const limit = opts?.take ?? PAGE_SIZE

  if (!isDatabaseConfigured() || !(await isDatabaseReachable())) {
    return sampleCardsForQuery(query).slice(0, limit)
  }

  try {
    await expireOverdueListings()
    const where = buildListingWhere(query)
    const intent = parseSearchIntent(query.q)
    // Listing-number pad matching may need a slightly wider SQL window.
    const take =
      intent?.kind === "listingNumber"
        ? Math.min(limit * 2, 48)
        : limit

    const rows = await prisma.listing.findMany({
      where,
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        owner: { select: { id: true, name: true, phone: true, whatsapp: true } },
      },
      orderBy: orderByForQuery(query.sort),
      take,
    })

    const labels = await complexLabelsForRows(rows)
    let cards = rows.map((r) =>
      toPublicListingCard(r, { complexLabels: labels })
    )

    if (intent?.kind === "listingNumber") {
      cards = cards.filter((card) =>
        listingNumberMatches(card.listingNumber, intent.code)
      )
    } else if (intent?.kind === "title") {
      // SQL already filtered; keep matchesSmartSearch as safety net for odd locales
      cards = cards.filter((card) => matchesSmartSearch(card, query.q))
    }

    if (cards.length > 0) return cards.slice(0, limit)
    // A filter that matches nothing must not be replaced by unrelated samples
    // while real listings exist. That made the header count and the cards diverge.
    if (await liveMarketplaceHasListings()) return []
    return sampleFallback([], query, limit)
  } catch {
    return sampleFallback([], query, limit)
  }
}

export async function fetchListingById(
  id: string
): Promise<PublicListingCard | null> {
  if (!isDatabaseConfigured() || !(await isDatabaseReachable())) {
    const sample = sampleListings.find((l) => l.slug === id)
    if (!sample) return null
    return enrichSampleCardOwner(
      {
        ...sample,
        id: sample.slug,
        ownerPhone: "9647501234567",
        ownerWhatsapp: "9647501234567",
        listingNumber: formatListingNumber(sample.listingNumber),
        contactMethod: "ALL",
        services: sample.services ?? [],
      },
      sample.slug
    )
  }

  try {
    await expireOverdueListings({ listingId: id })
    const row = await prisma.listing.findFirst({
      where: { id, ...publicListingVisibilityWhere() },
      include: {
        images: true,
        owner: { select: { id: true, name: true, phone: true, whatsapp: true } },
      },
    })
    if (row) {
      const labels = await complexLabelsForRows([row])
      return toPublicListingCard(row, { complexLabels: labels })
    }
  } catch {
    /* fall through to samples */
  }

  const sample = sampleListings.find((l) => l.slug === id)
  return sample
    ? enrichSampleCardOwner(
        {
          ...sample,
          id: sample.slug,
          ownerPhone: "9647501234567",
          ownerWhatsapp: "9647501234567",
          listingNumber: formatListingNumber(sample.listingNumber),
          contactMethod: "ALL",
          services: sample.services ?? [],
        },
        sample.slug
      )
    : null
}

export async function fetchListingsByAdvertiser(
  slug: string
): Promise<{ advertiser: PublicAdvertiser | null; listings: PublicListingCard[] }> {
  const demo = getDemoAdvertiser(slug)
  if (demo) {
    return {
      advertiser: demo,
      listings: sampleListingsForAdvertiser(slug),
    }
  }

  const userId = parseUserAdvertiserSlug(slug)
  if (!userId || !isDatabaseConfigured()) {
    return { advertiser: null, listings: [] }
  }

  try {
    const owner = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    })
    if (!owner) return { advertiser: null, listings: [] }

    await expireOverdueListings({ ownerId: owner.id })
    const rows = await prisma.listing.findMany({
      where: { ownerId: owner.id, ...publicListingVisibilityWhere() },
      include: {
        images: true,
        owner: { select: { id: true, name: true, phone: true, whatsapp: true } },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: PAGE_SIZE,
    })

    const labels = await complexLabelsForRows(rows)
    return {
      advertiser: {
        slug,
        name: owner.name,
        kind: "person",
        isDemo: false,
        subtitle: "معلن فردي",
      },
      listings: rows.map((r) =>
        toPublicListingCard(r, { complexLabels: labels })
      ),
    }
  } catch {
    return { advertiser: null, listings: [] }
  }
}

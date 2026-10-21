import { isDatabaseConfigured, prisma } from "@/lib/db"
import { getSessionUser, type SessionUser } from "@/lib/auth"
import { sampleListings } from "@/lib/sample-listings"
import {
  demoAdvertiserForListingSlug,
} from "@/lib/demo-advertisers"

export type AdminOverviewStats = {
  pending: number
  pendingListings: number
  pendingRequests: number
  active: number
  rejected: number
  users: number
  demoSampleCount: number
  dbReady: boolean
}

export async function fetchAdminOverviewStats(): Promise<AdminOverviewStats> {
  const demoSampleCount = sampleListings.length
  if (!isDatabaseConfigured()) {
    return {
      pending: 0,
      pendingListings: 0,
      pendingRequests: 0,
      active: 0,
      rejected: 0,
      users: 0,
      demoSampleCount,
      dbReady: false,
    }
  }

  try {
    const [pendingListings, pendingRequests, active, rejected, users] =
      await Promise.all([
        prisma.listing.count({ where: { status: "PENDING" } }),
        prisma.propertyRequest.count({ where: { status: "PENDING" } }),
        prisma.listing.count({ where: { status: "ACTIVE" } }),
        prisma.listing.count({ where: { status: "REJECTED" } }),
        prisma.user.count(),
      ])
    return {
      pending: pendingListings + pendingRequests,
      pendingListings,
      pendingRequests,
      active,
      rejected,
      users,
      demoSampleCount,
      dbReady: true,
    }
  } catch {
    return {
      pending: 0,
      pendingListings: 0,
      pendingRequests: 0,
      active: 0,
      rejected: 0,
      users: 0,
      demoSampleCount,
      dbReady: false,
    }
  }
}

/**
 * Read the current session for admin pages. Admin grants are explicit and are
 * never inferred from being the first user in an environment.
 */
export async function ensureBootstrapAdmin(): Promise<SessionUser | null> {
  return getSessionUser()
}

export async function fetchAdminUsers(take = 100) {
  if (!isDatabaseConfigured()) return []
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        whatsapp: true,
        createdAt: true,
        accountType: true,
        agencyUpgradeStatus: true,
        agencyOfficeName: true,
        agencyLogoUrl: true,
        agencySocialUrl: true,
        agencyAddressLine: true,
        agencyCitySlug: true,
        agencyDistrictSlug: true,
        agencyNeighborhoodSlug: true,
        agencyRequestNote: true,
        agencyMemberships: {
          where: { status: "ACTIVE" },
          take: 1,
          select: {
            role: true,
            agency: { select: { name: true, slug: true } },
          },
        },
        _count: { select: { listings: true, favorites: true } },
      },
    })
  } catch {
    return []
  }
}

/** Demo rows for empty moderation queues — marked clearly as samples. */
export function demoAdminListingRows() {
  return sampleListings.slice(0, 12).map((item) => {
    const adv = demoAdvertiserForListingSlug(item.slug)
    return {
      id: item.slug,
      title: item.title,
      status: "PENDING" as const,
      isDemo: true as const,
      deal: item.deal,
      category: item.category,
      price: item.price,
      area: item.area,
      rooms: item.rooms,
      areaM2: item.areaM2,
      floor: item.floor,
      heating: item.heating,
      furnished: item.furnished,
      description: item.description,
      image: item.image,
      images: item.images,
      ownerName: adv.name,
      ownerKind: adv.kind,
      listingNumber: item.listingNumber,
    }
  })
}

import type { Prisma } from "@prisma/client"

import { isDatabaseConfigured, isDatabaseReachable, prisma } from "@/lib/db"
import { formatPublicArea, formatShortArea } from "@/lib/locations"
import { PROJECT_GALLERY_MAX } from "@/lib/project-gallery"
import { RESIDENTIAL_PROJECT_KINDS } from "@/lib/project-kinds"

export type AgencyDirectoryCard = {
  id: string
  slug: string
  officeName: string
  logoUrl: string | null
  phone: string | null
  whatsapp: string | null
  socialUrl: string | null
  bio: string | null
  addressLine: string | null
  citySlug: string | null
  districtSlug: string | null
  neighborhoodSlug: string | null
  locationLabel: string
  projectNames: string[]
  coverUrl: string | null
  websiteUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  mapLat: number | null
  mapLng: number | null
}

export type AgencyDirectoryFilters = {
  city?: string
  district?: string
  neighborhood?: string
  projectSlug?: string
}

/** Public agency profile slug — same u-{id} pattern as advertiser for deep links. */
export function agencyPublicSlug(userId: string): string {
  return `u-${userId}`
}

export function parseAgencyPublicSlug(slug: string): string | null {
  if (slug.startsWith("u-")) return slug.slice(2) || null
  if (slug.startsWith("a-")) return slug.slice(2) || null
  return null
}

function approvedAgencyWhere(
  filters: AgencyDirectoryFilters = {}
): Prisma.AgencyWhereInput {
  const where: Prisma.AgencyWhereInput = {
    status: "APPROVED",
  }

  if (filters.projectSlug) {
    where.createdBy = {
      agencyProjects: {
      some: {
        project: { slug: filters.projectSlug, status: "APPROVED" },
      },
      },
    }
  }

  if (filters.city) where.citySlug = filters.city
  if (filters.district) where.districtSlug = filters.district
  if (filters.neighborhood) where.neighborhoodSlug = filters.neighborhood

  return where
}

function toCard(agency: {
  id: string
  name: string
  phone: string | null
  whatsapp: string | null
  slug: string
  logoUrl: string | null
  coverUrl: string | null
  bio: string | null
  addressLine: string | null
  citySlug: string | null
  districtSlug: string | null
  neighborhoodSlug: string | null
  websiteUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  mapLat: number | null
  mapLng: number | null
  createdBy: { agencyProjects?: { project: { name: string } }[] }
}): AgencyDirectoryCard {
  const locationLabel =
    agency.citySlug
      ? formatShortArea({
          city: agency.citySlug,
          district: agency.districtSlug ?? "",
          neighborhood: agency.neighborhoodSlug ?? "",
        }) ||
        formatPublicArea({
          city: agency.citySlug,
          district: agency.districtSlug ?? "",
          neighborhood: agency.neighborhoodSlug ?? "",
        })
      : "موقع غير محدد"

  return {
    id: agency.id,
    slug: agency.slug,
    officeName: agency.name,
    logoUrl: agency.logoUrl,
    phone: agency.phone,
    whatsapp: agency.whatsapp,
    socialUrl: agency.instagramUrl ?? agency.facebookUrl ?? agency.websiteUrl,
    bio: agency.bio,
    addressLine: agency.addressLine,
    citySlug: agency.citySlug,
    districtSlug: agency.districtSlug,
    neighborhoodSlug: agency.neighborhoodSlug,
    locationLabel,
    projectNames: (agency.createdBy.agencyProjects ?? []).map((p) => p.project.name),
    coverUrl: agency.coverUrl,
    websiteUrl: agency.websiteUrl,
    instagramUrl: agency.instagramUrl,
    facebookUrl: agency.facebookUrl,
    mapLat: agency.mapLat,
    mapLng: agency.mapLng,
  }
}

const agencySelect = {
  id: true,
  slug: true,
  name: true,
  phone: true,
  whatsapp: true,
  logoUrl: true,
  coverUrl: true,
  websiteUrl: true,
  instagramUrl: true,
  facebookUrl: true,
  bio: true,
  addressLine: true,
  citySlug: true,
  districtSlug: true,
  neighborhoodSlug: true,
  mapLat: true,
  mapLng: true,
  createdBy: {
    select: {
      agencyProjects: {
        include: { project: { select: { name: true, slug: true } } },
        orderBy: { createdAt: "desc" as const },
      },
    },
  },
} satisfies Prisma.AgencySelect

export async function fetchApprovedAgencies(
  filters: AgencyDirectoryFilters = {},
  take = 48
): Promise<AgencyDirectoryCard[]> {
  if (!isDatabaseConfigured() || !(await isDatabaseReachable())) return []
  try {
    const rows = await prisma.agency.findMany({
      where: approvedAgencyWhere(filters),
      select: agencySelect,
      orderBy: { name: "asc" },
      take,
    })
    return rows.map(toCard)
  } catch {
    return []
  }
}

export async function fetchAgencyBySlug(
  slug: string
): Promise<AgencyDirectoryCard | null> {
  const decoded = decodeURIComponent(slug)
  if (!decoded || !isDatabaseConfigured() || !(await isDatabaseReachable())) {
    return null
  }
  try {
    const row = await prisma.agency.findFirst({
      where: {
        slug: decoded,
        ...approvedAgencyWhere(),
      },
      select: agencySelect,
    })
    return row ? toCard(row) : null
  } catch {
    return null
  }
}

export type ListProjectsFilters = {
  /** Project name (partial, case-insensitive) */
  q?: string
  /** City slug from `iraqCities` */
  city?: string
  /** When true (default), exclude malls / commercial-only projects */
  residentialOnly?: boolean
}

export async function listProjects(
  filters?: ListProjectsFilters | string,
  take = 40
) {
  if (!isDatabaseConfigured() || !(await isDatabaseReachable())) return []
  try {
    const f: ListProjectsFilters =
      typeof filters === "string" ? { q: filters || undefined } : (filters ?? {})
    const query = f.q?.trim()
    const city = f.city?.trim()
    const residentialOnly = f.residentialOnly !== false

    return await prisma.project.findMany({
      where: {
        status: "APPROVED",
        ...(residentialOnly
          ? { projectKind: { in: RESIDENTIAL_PROJECT_KINDS } }
          : {}),
        ...(city ? { citySlug: city } : {}),
        ...(query
          ? { name: { contains: query, mode: "insensitive" as const } }
          : {}),
      },
      orderBy: { name: "asc" },
      take,
      select: {
        id: true,
        slug: true,
        name: true,
        projectKind: true,
        imageUrl: true,
        imageUrls: true,
        summary: true,
        websiteUrl: true,
        citySlug: true,
        districtSlug: true,
        neighborhoodSlug: true,
      },
    })
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[listProjects]", err)
    }
    return []
  }
}

export async function fetchProjectBySlug(slug: string) {
  if (!isDatabaseConfigured() || !(await isDatabaseReachable())) return null
  try {
    return await prisma.project.findFirst({
      where: {
        slug,
        status: "APPROVED",
        projectKind: { in: RESIDENTIAL_PROJECT_KINDS },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        projectKind: true,
        imageUrl: true,
        imageUrls: true,
        summary: true,
        websiteUrl: true,
        citySlug: true,
        districtSlug: true,
        neighborhoodSlug: true,
      },
    })
  } catch {
    return null
  }
}

export async function listPendingProjects(take = 50) {
  if (!isDatabaseConfigured()) return []
  try {
    return await prisma.project.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            agencyOfficeName: true,
            email: true,
          },
        },
      },
    })
  } catch {
    return []
  }
}

/** Admin catalog — all non-pending statuses for management UI. */
export async function listManagedProjects(take = 120) {
  if (!isDatabaseConfigured()) return []
  try {
    return await prisma.project.findMany({
      where: { status: { in: ["APPROVED", "REJECTED", "ARCHIVED"] } },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      take,
      include: {
        agencies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                agencyOfficeName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { photos: true, agencies: true },
        },
      },
    })
  } catch {
    return []
  }
}

/** Approved community gallery photos (newest first), capped at PROJECT_GALLERY_MAX. */
export async function listApprovedProjectPhotos(
  projectId: string,
  take = PROJECT_GALLERY_MAX
) {
  if (!isDatabaseConfigured() || !(await isDatabaseReachable())) return []
  try {
    return await prisma.projectPhoto.findMany({
      where: { projectId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: Math.min(take, PROJECT_GALLERY_MAX),
      select: {
        id: true,
        storagePath: true,
        contributorName: true,
        createdAt: true,
      },
    })
  } catch {
    return []
  }
}

export async function countApprovedProjectPhotos(projectId: string) {
  if (!isDatabaseConfigured()) return 0
  try {
    return await prisma.projectPhoto.count({
      where: { projectId, status: "APPROVED" },
    })
  } catch {
    return 0
  }
}

export async function listPendingProjectPhotos(take = 80) {
  if (!isDatabaseConfigured()) return []
  try {
    return await prisma.projectPhoto.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        project: {
          select: { id: true, name: true, slug: true },
        },
      },
    })
  } catch {
    return []
  }
}

export async function listAgencyProjectsForUser(userId: string) {
  if (!isDatabaseConfigured()) return []
  try {
    const rows = await prisma.agencyProject.findMany({
      where: { userId },
      include: { project: true },
      orderBy: { createdAt: "desc" },
    })
    return rows.map((r) => ({
      ...r.project,
      isOfficialSalesDesk: r.isOfficialSalesDesk,
    }))
  } catch {
    return []
  }
}

/** Pending proposals created by this agency (not yet approved). */
export async function listPendingProposalsForUser(userId: string) {
  if (!isDatabaseConfigured()) return []
  try {
    return await prisma.project.findMany({
      where: { createdById: userId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    })
  } catch {
    return []
  }
}

export function slugifyProjectName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return base || `project-${Date.now().toString(36)}`
}

import "server-only"

import type { AgencyMembership, Prisma } from "@prisma/client"

import {
  AGENCY_ACTIVE_LISTING_LIMIT,
  CAPACITY_STATUSES,
  resolveAgencyMemberQuotas,
} from "@/lib/billing-policy"
import { prisma } from "@/lib/db"
import { mayManageAgencyListing } from "@/lib/agency-policy"

export type DbClient = Prisma.TransactionClient | typeof prisma

export async function getActiveAgencyMembership(
  userId: string,
  db: DbClient = prisma
) {
  return db.agencyMembership.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { agency: true },
  })
}

export async function requireAgencyMembership(
  userId: string,
  db: DbClient = prisma
) {
  const membership = await getActiveAgencyMembership(userId, db)
  if (!membership) throw new Error("AGENCY_MEMBERSHIP_REQUIRED")
  return membership
}

export async function requireAgencyOwner(
  userId: string,
  db: DbClient = prisma
) {
  const membership = await requireAgencyMembership(userId, db)
  if (membership.role !== "OWNER") throw new Error("AGENCY_OWNER_REQUIRED")
  return membership
}

export async function canManageAgencyListing(
  userId: string,
  listing: { agencyId: string | null; assignedAgentId: string | null },
  db: DbClient = prisma
): Promise<boolean> {
  if (!listing.agencyId) return false
  const membership = await db.agencyMembership.findFirst({
    where: { agencyId: listing.agencyId, userId, status: "ACTIVE" },
    select: { role: true },
  })
  return mayManageAgencyListing({
    userId,
    assignedAgentId: listing.assignedAgentId,
    membership,
  })
}

export async function hasActiveAgencySubscription(
  agencyId: string,
  now: Date = new Date(),
  db: DbClient = prisma
): Promise<boolean> {
  const subscription = await db.agencySubscription.findFirst({
    where: {
      agencyId,
      status: "ACTIVE",
      startsAt: { lte: now },
      endsAt: { gt: now },
    },
    select: { id: true },
  })
  return Boolean(subscription)
}

export async function getAgencyMemberQuotaSnapshot(
  agencyId: string,
  db: DbClient = prisma
) {
  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    select: {
      quotaMode: true,
      memberships: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          userId: true,
          role: true,
          manualQuota: true,
          user: { select: { name: true, email: true, avatarUrl: true } },
        },
        orderBy: [{ joinedAt: "asc" }, { id: "asc" }],
      },
    },
  })
  if (!agency) throw new Error("AGENCY_NOT_FOUND")

  const quotas = resolveAgencyMemberQuotas({
    mode: agency.quotaMode,
    members: agency.memberships,
  })
  const usage = await db.listing.groupBy({
    by: ["assignedAgentId"],
    where: {
      agencyId,
      assignedAgentId: { not: null },
      status: { in: [...CAPACITY_STATUSES] },
    },
    _count: { _all: true },
  })
  const usageByUser = Object.fromEntries(
    usage
      .filter((row) => row.assignedAgentId)
      .map((row) => [row.assignedAgentId as string, row._count._all])
  )

  return agency.memberships.map((member) => ({
    ...member,
    quota: quotas[member.userId] ?? 0,
    used: usageByUser[member.userId] ?? 0,
  }))
}

/**
 * Serializes capacity checks per agency. The lock and insert/update must live
 * in the same transaction to make the 30-listing ceiling race-safe.
 */
export async function assertAgencyPublishingCapacity(
  tx: Prisma.TransactionClient,
  input: {
    agencyId: string
    userId: string
    excludeListingId?: string
    now?: Date
  }
): Promise<{
  membership: AgencyMembership
  agencyUsed: number
  agencyLimit: number
  memberUsed: number
  memberQuota: number
}> {
  const now = input.now ?? new Date()
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`agency-capacity:${input.agencyId}`}, 0))`

  await tx.listing.updateMany({
    where: {
      agencyId: input.agencyId,
      status: "ACTIVE",
      expiresAt: { lte: now },
    },
    data: { status: "EXPIRED" },
  })

  const membership = await tx.agencyMembership.findFirst({
    where: {
      agencyId: input.agencyId,
      userId: input.userId,
      status: "ACTIVE",
    },
  })
  if (!membership) throw new Error("AGENCY_MEMBERSHIP_REQUIRED")

  const agency = await tx.agency.findUnique({
    where: { id: input.agencyId },
    select: {
      status: true,
      quotaMode: true,
      memberships: {
        where: { status: "ACTIVE" },
        select: { userId: true, manualQuota: true },
      },
    },
  })
  if (!agency || agency.status !== "APPROVED") {
    throw new Error("AGENCY_NOT_APPROVED")
  }
  if (!(await hasActiveAgencySubscription(input.agencyId, now, tx))) {
    throw new Error("AGENCY_SUBSCRIPTION_REQUIRED")
  }

  const commonWhere: Prisma.ListingWhereInput = {
    agencyId: input.agencyId,
    status: { in: [...CAPACITY_STATUSES] },
    ...(input.excludeListingId
      ? { id: { not: input.excludeListingId } }
      : {}),
  }
  const [agencyUsed, memberUsed] = await Promise.all([
    tx.listing.count({ where: commonWhere }),
    tx.listing.count({
      where: { ...commonWhere, assignedAgentId: input.userId },
    }),
  ])
  const memberQuotas = resolveAgencyMemberQuotas({
    mode: agency.quotaMode,
    members: agency.memberships,
  })
  const memberQuota = memberQuotas[input.userId] ?? 0

  if (agencyUsed >= AGENCY_ACTIVE_LISTING_LIMIT) {
    throw new Error("AGENCY_LISTING_LIMIT_REACHED")
  }
  if (memberUsed >= memberQuota) {
    throw new Error("AGENCY_MEMBER_QUOTA_REACHED")
  }

  return {
    membership,
    agencyUsed,
    agencyLimit: AGENCY_ACTIVE_LISTING_LIMIT,
    memberUsed,
    memberQuota,
  }
}

export async function ensureAgencyForApprovedOwner(
  userId: string,
  db: DbClient = prisma
) {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("USER_NOT_FOUND")

  const activeMembership = await db.agencyMembership.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { agency: true },
  })
  if (activeMembership?.role === "AGENT") {
    throw new Error("AGENCY_AGENT_CANNOT_OWN")
  }

  const agencyData = {
    name: user.agencyOfficeName?.trim() || user.name,
    status: "APPROVED" as const,
    logoUrl: user.agencyLogoUrl,
    bio: user.agencyBio,
    phone: user.phone,
    whatsapp: user.whatsapp,
    instagramUrl: user.agencySocialUrl,
    citySlug: user.agencyCitySlug,
    districtSlug: user.agencyDistrictSlug,
    neighborhoodSlug: user.agencyNeighborhoodSlug,
    addressLine: user.agencyAddressLine,
  }

  if (activeMembership?.role === "OWNER") {
    return db.agency.update({
      where: { id: activeMembership.agencyId },
      data: agencyData,
    })
  }

  const agency = await db.agency.upsert({
    where: { slug: `u-${user.id}` },
    create: {
      slug: `u-${user.id}`,
      ...agencyData,
      createdById: user.id,
    },
    update: agencyData,
  })

  await db.agencyMembership.upsert({
    where: { agencyId_userId: { agencyId: agency.id, userId: user.id } },
    create: {
      agencyId: agency.id,
      userId: user.id,
      role: "OWNER",
      status: "ACTIVE",
      manualQuota: AGENCY_ACTIVE_LISTING_LIMIT,
    },
    update: { role: "OWNER", status: "ACTIVE", leftAt: null },
  })
  return agency
}

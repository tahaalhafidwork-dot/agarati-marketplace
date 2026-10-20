"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin, requireSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import {
  computeExpiresAt,
  expireOverdueListings,
  publicListingVisibilityWhere,
} from "@/lib/listing-quota"
import {
  assertAgencyPublishingCapacity,
  canManageAgencyListing,
  hasActiveAgencySubscription,
} from "@/lib/agency-service"
import {
  CAPACITY_STATUSES,
  INDIVIDUAL_ACTIVE_LISTING_LIMIT,
} from "@/lib/billing-policy"
import { requestIndividualListingPayment } from "@/lib/payment-service"

export async function recordListingViewAction(listingId: string) {
  if (!isDatabaseConfigured()) return
  try {
    await expireOverdueListings({ listingId })
    await prisma.listing.update({
      where: {
        id: listingId,
        ...publicListingVisibilityWhere(),
      },
      data: { viewCount: { increment: 1 } },
    })
  } catch {
    /* ignore missing / non-active */
  }
}

export type ComplexModerationDecision =
  | "approve"
  | "merge"
  | "reject"
  | "none"

export type ModerateListingOptions = {
  note?: string
  /** Rename pending project before approving (with complexDecision=approve) */
  complexName?: string
  /** Merge into an existing APPROVED project slug */
  mergeIntoComplexSlug?: string
  /**
   * How to handle a proposed / pending complex independently of the listing:
   * - approve: approve PENDING project (optionally rename)
   * - merge: point listing to an APPROVED project; reject orphan PENDING
   * - reject: reject orphan PENDING; detach complex from listing
   * - none: no complex proposal to handle
   */
  complexDecision?: ComplexModerationDecision
}

async function rejectOrphanPendingProject(
  projectId: string,
  projectSlug: string,
  listingId: string
) {
  const otherListings = await prisma.listing.count({
    where: {
      complexSlug: projectSlug,
      id: { not: listingId },
      status: { not: "REJECTED" },
    },
  })
  if (otherListings === 0) {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "REJECTED", reviewedAt: new Date() },
    })
  }
}

/**
 * Resolve complex proposal for a listing. Returns final complexSlug to keep
 * on the listing (null = detach).
 */
async function resolveComplexDecision(
  listing: {
    id: string
    complexSlug: string | null
    proposedComplexName: string | null
    citySlug: string
  },
  opts: ModerateListingOptions,
  keepLinkOnListing: boolean
): Promise<string | null> {
  const decision = opts.complexDecision ?? "none"
  if (decision === "none" || !listing.complexSlug) {
    return listing.complexSlug
  }

  const project = await prisma.project.findFirst({
    where: { slug: listing.complexSlug },
  })

  if (decision === "merge") {
    const targetSlug = opts.mergeIntoComplexSlug?.trim()
    if (!targetSlug) throw new Error("MERGE_TARGET_MISSING")
    const target = await prisma.project.findFirst({
      where: { slug: targetSlug, status: "APPROVED" },
    })
    if (!target) throw new Error("MERGE_TARGET_MISSING")

    if (project && project.status === "PENDING") {
      await rejectOrphanPendingProject(project.id, project.slug, listing.id)
    }
    return keepLinkOnListing ? target.slug : null
  }

  if (decision === "reject") {
    if (project && project.status === "PENDING") {
      await rejectOrphanPendingProject(project.id, project.slug, listing.id)
    }
    return null
  }

  // approve
  if (project?.status === "PENDING") {
    const newName =
      opts.complexName?.trim() ||
      listing.proposedComplexName?.trim() ||
      project.name
    await prisma.project.update({
      where: { id: project.id },
      data: {
        name: newName,
        status: "APPROVED",
        reviewedAt: new Date(),
      },
    })
    return keepLinkOnListing ? project.slug : null
  }

  if (!project && listing.proposedComplexName) {
    const slug = listing.complexSlug
    const name =
      opts.complexName?.trim() || listing.proposedComplexName.trim()
    const existing = await prisma.project.findUnique({ where: { slug } })
    if (!existing) {
      await prisma.project.create({
        data: {
          slug,
          name,
          status: "APPROVED",
          projectKind: "RESIDENTIAL",
          citySlug: listing.citySlug,
          reviewedAt: new Date(),
        },
      })
    } else if (existing.status === "PENDING") {
      await prisma.project.update({
        where: { id: existing.id },
        data: {
          name,
          status: "APPROVED",
          reviewedAt: new Date(),
        },
      })
    }
    return keepLinkOnListing ? slug : null
  }

  // Already approved project linked — keep or detach
  if (project?.status === "APPROVED") {
    return keepLinkOnListing ? project.slug : null
  }

  return keepLinkOnListing ? listing.complexSlug : null
}

export async function moderateListingAction(
  listingId: string,
  decision: "ACTIVE" | "REJECTED",
  options?: ModerateListingOptions | string
) {
  await requireAdmin()
  if (!isDatabaseConfigured()) throw new Error("DB not configured")

  const opts: ModerateListingOptions =
    typeof options === "string" ? { note: options } : (options ?? {})

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      complexSlug: true,
      proposedComplexName: true,
      citySlug: true,
      ownerId: true,
      agencyId: true,
      assignedAgentId: true,
      billingKind: true,
      billingState: true,
      expiresAt: true,
    },
  })
  if (!listing) throw new Error("NOT_FOUND")

  // Only a user-proposed name needs complex review; an existing APPROVED link does not.
  const hasProposal = Boolean(listing.proposedComplexName?.trim())

  // Default complex handling when admin doesn't pass an explicit decision
  let complexDecision = opts.complexDecision
  if (!complexDecision) {
    if (!hasProposal) complexDecision = "none"
    else if (opts.mergeIntoComplexSlug) complexDecision = "merge"
    else if (decision === "ACTIVE") complexDecision = "approve"
    else complexDecision = "reject"
  }

  const resolvedOpts: ModerateListingOptions = {
    ...opts,
    complexDecision,
  }

  // Keep complex on listing only when publishing the ad
  const keepLink = decision === "ACTIVE" && complexDecision !== "reject"
  const finalComplexSlug = await resolveComplexDecision(
    listing,
    resolvedOpts,
    keepLink
  )

  const now = new Date()
  const approvedExpiresAt =
    listing.expiresAt && listing.expiresAt > now
      ? listing.expiresAt
      : computeExpiresAt(now)
  await prisma.$transaction(async (tx) => {
    let canActivate = decision === "ACTIVE"
    let blockedBillingState:
      | "PAYMENT_REQUIRED"
      | "SUBSCRIPTION_REQUIRED"
      | null = null

    if (decision === "ACTIVE" && listing.agencyId) {
      if (!(await hasActiveAgencySubscription(listing.agencyId, now, tx))) {
        canActivate = false
        blockedBillingState = "SUBSCRIPTION_REQUIRED"
      } else {
        await assertAgencyPublishingCapacity(tx, {
          agencyId: listing.agencyId,
          userId: listing.assignedAgentId ?? listing.ownerId,
          excludeListingId: listing.id,
          now,
        })
      }
    } else if (decision === "ACTIVE") {
      if (
        listing.billingKind === "PERSONAL_PAID" &&
        listing.billingState !== "READY"
      ) {
        canActivate = false
        blockedBillingState = "PAYMENT_REQUIRED"
      } else {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`personal-capacity:${listing.ownerId}`}, 0))`
        const used = await tx.listing.count({
          where: {
            ownerId: listing.ownerId,
            agencyId: null,
            id: { not: listing.id },
            status: { in: [...CAPACITY_STATUSES] },
          },
        })
        if (used >= INDIVIDUAL_ACTIVE_LISTING_LIMIT) {
          throw new Error("INDIVIDUAL_LISTING_LIMIT_REACHED")
        }
      }
    }

    return tx.listing.update({
      where: { id: listingId },
      data:
        decision === "ACTIVE"
          ? {
              status: canActivate ? "ACTIVE" : "PENDING",
              moderationNote: opts.note || null,
              moderationApprovedAt: now,
              billingState: blockedBillingState ?? "READY",
              assignedAgentId: listing.agencyId
                ? listing.assignedAgentId ?? listing.ownerId
                : undefined,
              publishedAt: canActivate ? now : null,
              expiresAt: canActivate ? approvedExpiresAt : listing.expiresAt,
              visibilityPaused: false,
              proposedComplexName: null,
              complexSlug: finalComplexSlug,
            }
          : {
              status: "REJECTED",
              moderationApprovedAt: null,
              moderationNote: opts.note || "مرفوض من الإدارة",
              publishedAt: null,
              proposedComplexName: null,
              complexSlug: finalComplexSlug,
            },
    })
  })

  revalidatePath("/admin/properties")
  revalidatePath("/admin/projects")
  revalidatePath("/dashboard/properties")
  revalidatePath("/properties")
  revalidatePath("/projects")
  revalidatePath("/")
}

export async function deleteListingAction(listingId: string) {
  const user = await requireSessionUser()
  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!listing) return
  const managesAgency = await canManageAgencyListing(user.id, listing)
  const ownsPersonal = !listing.agencyId && listing.ownerId === user.id
  if (
    !ownsPersonal &&
    !managesAgency &&
    user.role !== "ADMIN"
  ) {
    throw new Error("FORBIDDEN")
  }
  await prisma.listing.delete({ where: { id: listingId } })
  revalidatePath("/dashboard/properties")
  revalidatePath("/admin/properties")
  revalidatePath("/properties")
}

/** Owner toggles public visibility without freeing quota. */
export async function toggleListingVisibilityAction(listingId: string) {
  const user = await requireSessionUser()
  if (!isDatabaseConfigured()) throw new Error("DB not configured")

  await expireOverdueListings({ listingId })

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      ownerId: true,
      agencyId: true,
      assignedAgentId: true,
      status: true,
      visibilityPaused: true,
    },
  })
  const managesAgency = listing
    ? await canManageAgencyListing(user.id, listing)
    : false
  const ownsPersonal = Boolean(
    listing && !listing.agencyId && listing.ownerId === user.id
  )
  if (
    !listing ||
    (!ownsPersonal && !managesAgency)
  ) {
    throw new Error("FORBIDDEN")
  }
  if (listing.status !== "ACTIVE") {
    throw new Error("ONLY_ACTIVE")
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: { visibilityPaused: !listing.visibilityPaused },
  })

  revalidatePath("/dashboard/properties")
  revalidatePath(`/properties/${listingId}`)
  revalidatePath("/properties")
  revalidatePath("/")
}

/** Renew an expired listing according to its immutable billing owner. */
export async function republishListingAction(listingId: string) {
  const user = await requireSessionUser()
  if (!isDatabaseConfigured()) throw new Error("DB not configured")

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      ownerId: true,
      agencyId: true,
      assignedAgentId: true,
      status: true,
      billingKind: true,
      moderationApprovedAt: true,
    },
  })
  const managesAgency = listing
    ? await canManageAgencyListing(user.id, listing)
    : false
  const ownsPersonal = Boolean(
    listing && !listing.agencyId && listing.ownerId === user.id
  )
  if (
    !listing ||
    (!ownsPersonal && !managesAgency)
  ) {
    throw new Error("FORBIDDEN")
  }
  if (listing.status !== "EXPIRED") {
    throw new Error("ONLY_EXPIRED")
  }

  if (listing.billingKind === "PERSONAL_PAID") {
    await prisma.listing.update({
      where: { id: listing.id },
      data: { billingState: "PAYMENT_REQUIRED" },
    })
    await requestIndividualListingPayment(user.id, listing.id)
  } else {
    const now = new Date()
    await prisma.$transaction(async (tx) => {
      if (listing.agencyId) {
        await assertAgencyPublishingCapacity(tx, {
          agencyId: listing.agencyId,
          userId: listing.assignedAgentId ?? user.id,
          excludeListingId: listing.id,
          now,
        })
      } else {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`personal-capacity:${listing.ownerId}`}, 0))`
        const used = await tx.listing.count({
          where: {
            ownerId: listing.ownerId,
            agencyId: null,
            id: { not: listing.id },
            status: { in: [...CAPACITY_STATUSES] },
          },
        })
        if (used >= INDIVIDUAL_ACTIVE_LISTING_LIMIT) {
          throw new Error("INDIVIDUAL_LISTING_LIMIT_REACHED")
        }
      }
      await tx.listing.update({
        where: { id: listing.id },
        data: {
          status: "ACTIVE",
          billingState: "READY",
          assignedAgentId:
            listing.agencyId && !listing.assignedAgentId ? user.id : undefined,
          moderationApprovedAt: listing.moderationApprovedAt ?? now,
          publishedAt: now,
          expiresAt: computeExpiresAt(now),
          visibilityPaused: false,
          moderationNote: null,
        },
      })
    })
  }

  revalidatePath("/dashboard/properties")
  revalidatePath(`/properties/${listingId}`)
  revalidatePath("/properties")
  revalidatePath("/")
}

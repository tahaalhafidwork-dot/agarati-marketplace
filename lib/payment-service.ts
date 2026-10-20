import "server-only"

import type { Prisma } from "@prisma/client"

import {
  AGENCY_SUBSCRIPTION_DAYS,
  AGENCY_SUBSCRIPTION_PRICE_IQD,
  INDIVIDUAL_PAID_LISTING_PRICE_IQD,
  LISTING_TERM_DAYS,
  addUtcDays,
  agencySubscriptionPaymentIdempotencyKey,
  listingPaymentIdempotencyKey,
  nextTermStart,
} from "@/lib/billing-policy"
import {
  assertAgencyPublishingCapacity,
  requireAgencyOwner,
} from "@/lib/agency-service"
import { prisma } from "@/lib/db"

export async function requestIndividualListingPayment(
  userId: string,
  listingId: string,
  db: typeof prisma | Prisma.TransactionClient = prisma
) {
  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      ownerId: true,
      agencyId: true,
      billingKind: true,
      expiresAt: true,
    },
  })
  if (!listing || listing.ownerId !== userId || listing.agencyId) {
    throw new Error("LISTING_PAYMENT_FORBIDDEN")
  }
  if (listing.billingKind !== "PERSONAL_PAID") {
    throw new Error("LISTING_PAYMENT_NOT_REQUIRED")
  }

  const idempotencyKey = listingPaymentIdempotencyKey(listing)
  const existing = await db.paymentRequest.findUnique({ where: { idempotencyKey } })
  if (existing) {
    if (existing.status === "REJECTED" || existing.status === "CANCELLED") {
      return db.paymentRequest.update({
        where: { id: existing.id },
        data: {
          status: "PENDING",
          rejectionReason: null,
          approvedById: null,
          approvedAt: null,
        },
      })
    }
    return existing
  }
  try {
    return await db.paymentRequest.create({
      data: {
        idempotencyKey,
        purpose: "INDIVIDUAL_LISTING",
        amountIqd: INDIVIDUAL_PAID_LISTING_PRICE_IQD,
        listingId: listing.id,
        requestedById: userId,
      },
    })
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const raced = await db.paymentRequest.findUnique({ where: { idempotencyKey } })
      if (raced) return raced
    }
    throw error
  }
}

export async function requestAgencySubscriptionPayment(
  userId: string,
  db: typeof prisma = prisma
) {
  const membership = await requireAgencyOwner(userId, db)
  const latest = await db.agencySubscription.findFirst({
    where: { agencyId: membership.agencyId, status: { in: ["ACTIVE", "PENDING"] } },
    orderBy: { endsAt: "desc" },
    select: { endsAt: true },
  })
  const idempotencyKey = agencySubscriptionPaymentIdempotencyKey(
    membership.agencyId,
    latest?.endsAt
  )
  const existing = await db.paymentRequest.findUnique({ where: { idempotencyKey } })
  if (existing) {
    if (existing.status === "REJECTED" || existing.status === "CANCELLED") {
      return db.paymentRequest.update({
        where: { id: existing.id },
        data: {
          status: "PENDING",
          rejectionReason: null,
          approvedById: null,
          approvedAt: null,
        },
      })
    }
    return existing
  }
  try {
    return await db.paymentRequest.create({
      data: {
        idempotencyKey,
        purpose: "AGENCY_SUBSCRIPTION",
        amountIqd: AGENCY_SUBSCRIPTION_PRICE_IQD,
        agencyId: membership.agencyId,
        requestedById: userId,
      },
    })
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const raced = await db.paymentRequest.findUnique({ where: { idempotencyKey } })
      if (raced) return raced
    }
    throw error
  }
}

export async function approvePaymentRequest(input: {
  paymentId: string
  adminId: string
  externalReference?: string | null
  now?: Date
}) {
  const now = input.now ?? new Date()
  const externalReference = input.externalReference?.trim()
  if (!externalReference) throw new Error("PAYMENT_REFERENCE_REQUIRED")
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`payment:${input.paymentId}`}, 0))`
    const payment = await tx.paymentRequest.findUnique({
      where: { id: input.paymentId },
      include: { listing: true },
    })
    if (!payment) throw new Error("PAYMENT_NOT_FOUND")
    if (payment.status === "APPROVED" && payment.appliedAt) {
      return { payment, alreadyApplied: true as const }
    }
    if (payment.status !== "PENDING") throw new Error("PAYMENT_NOT_PENDING")

    if (payment.purpose === "INDIVIDUAL_LISTING") {
      const listing = payment.listing
      if (
        !listing ||
        listing.agencyId ||
        listing.billingKind !== "PERSONAL_PAID"
      ) {
        throw new Error("INVALID_LISTING_PAYMENT")
      }
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`personal-capacity:${listing.ownerId}`}, 0))`
      const activeCount = await tx.listing.count({
        where: {
          ownerId: listing.ownerId,
          agencyId: null,
          id: { not: listing.id },
          status: { in: ["PENDING", "ACTIVE"] },
        },
      })
      if (activeCount >= 3) throw new Error("INDIVIDUAL_LISTING_LIMIT_REACHED")

      const canPublish = Boolean(listing.moderationApprovedAt)
      const startsAt = nextTermStart(listing.expiresAt, now)
      const endsAt = canPublish
        ? addUtcDays(startsAt, LISTING_TERM_DAYS)
        : listing.expiresAt
      await tx.listing.update({
        where: { id: listing.id },
        data: {
          billingState: "READY",
          expiresAt: endsAt,
          ...(canPublish
            ? {
                status: "ACTIVE",
                publishedAt: now,
                visibilityPaused: false,
              }
            : {}),
        },
      })
    } else {
      if (!payment.agencyId) throw new Error("INVALID_AGENCY_PAYMENT")
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`agency-subscription:${payment.agencyId}`}, 0))`
      const latest = await tx.agencySubscription.findFirst({
        where: { agencyId: payment.agencyId, status: "ACTIVE" },
        orderBy: { endsAt: "desc" },
      })
      const startsAt = nextTermStart(latest?.endsAt, now)
      const endsAt = addUtcDays(startsAt, AGENCY_SUBSCRIPTION_DAYS)
      await tx.agencySubscription.create({
        data: {
          agencyId: payment.agencyId,
          paymentId: payment.id,
          status: "ACTIVE",
          priceIqd: payment.amountIqd,
          startsAt,
          endsAt,
        },
      })

      const awaitingListings = await tx.listing.findMany({
        where: {
          agencyId: payment.agencyId,
          status: "PENDING",
          billingState: "SUBSCRIPTION_REQUIRED",
          moderationApprovedAt: { not: null },
        },
        orderBy: { createdAt: "asc" },
        select: { id: true, ownerId: true, assignedAgentId: true },
      })
      for (const listing of awaitingListings) {
        await assertAgencyPublishingCapacity(tx, {
          agencyId: payment.agencyId,
          userId: listing.assignedAgentId ?? listing.ownerId,
          excludeListingId: listing.id,
          now,
        })
        await tx.listing.update({
          where: { id: listing.id },
          data: {
            status: "ACTIVE",
            billingState: "READY",
            publishedAt: now,
            expiresAt: addUtcDays(now, LISTING_TERM_DAYS),
            visibilityPaused: false,
          },
        })
      }
    }

    const applied = await tx.paymentRequest.update({
      where: { id: payment.id },
      data: {
        status: "APPROVED",
        approvedById: input.adminId,
        approvedAt: now,
        appliedAt: now,
        externalReference,
        rejectionReason: null,
      },
    })
    return { payment: applied, alreadyApplied: false as const }
  })
}

export async function rejectPaymentRequest(input: {
  paymentId: string
  adminId: string
  reason?: string | null
}) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`payment:${input.paymentId}`}, 0))`
    const result = await tx.paymentRequest.updateMany({
      where: { id: input.paymentId, status: "PENDING" },
      data: {
        status: "REJECTED",
        approvedById: input.adminId,
        approvedAt: new Date(),
        rejectionReason: input.reason?.trim() || "رفض طلب الدفع",
      },
    })
    if (result.count !== 1) throw new Error("PAYMENT_NOT_PENDING")
  })
}

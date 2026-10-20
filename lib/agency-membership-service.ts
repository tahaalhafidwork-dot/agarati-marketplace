import "server-only"

import { createHash, randomBytes } from "node:crypto"

import type { Prisma } from "@prisma/client"

import {
  AGENCY_ACTIVE_LISTING_LIMIT,
  CAPACITY_STATUSES,
  resolveAgencyMemberQuotas,
  validateManualAgencyQuotas,
} from "@/lib/billing-policy"
import { requireAgencyOwner } from "@/lib/agency-service"
import { prisma } from "@/lib/db"
import { invitationAcceptanceError } from "@/lib/agency-policy"

export const AGENCY_INVITATION_DAYS = 7

export function normalizeInvitationEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export async function createAgencyInvitation(input: {
  ownerId: string
  email: string
  manualQuota?: number
  now?: Date
}) {
  const now = input.now ?? new Date()
  const emailNormalized = normalizeInvitationEmail(input.email)
  if (!emailNormalized || !emailNormalized.includes("@")) {
    throw new Error("INVALID_INVITATION_EMAIL")
  }
  const manualQuota = Math.trunc(input.manualQuota ?? 0)
  if (manualQuota < 0 || manualQuota > AGENCY_ACTIVE_LISTING_LIMIT) {
    throw new Error("INVALID_MEMBER_QUOTA")
  }

  const rawToken = randomBytes(32).toString("base64url")
  const tokenHash = hashInvitationToken(rawToken)
  const expiresAt = new Date(now)
  expiresAt.setUTCDate(expiresAt.getUTCDate() + AGENCY_INVITATION_DAYS)

  const invitation = await prisma.$transaction(async (tx) => {
    const owner = await requireAgencyOwner(input.ownerId, tx)
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`agency-members:${owner.agencyId}`}, 0))`

    const existingUser = await tx.user.findUnique({
      where: { email: emailNormalized },
      select: { id: true },
    })
    if (existingUser?.id === input.ownerId) throw new Error("CANNOT_INVITE_SELF")
    if (existingUser) {
      const active = await tx.agencyMembership.findFirst({
        where: { userId: existingUser.id, status: "ACTIVE" },
        select: { agencyId: true },
      })
      if (active) throw new Error("USER_ALREADY_IN_AGENCY")
    }

    if (owner.agency.quotaMode === "MANUAL") {
      const members = await tx.agencyMembership.findMany({
        where: { agencyId: owner.agencyId, status: "ACTIVE" },
        select: { manualQuota: true },
      })
      const validation = validateManualAgencyQuotas([
        ...members.map((member) => member.manualQuota),
        manualQuota,
      ])
      if (!validation.ok) throw new Error("AGENCY_QUOTA_TOTAL_EXCEEDED")
    }

    await tx.agencyInvitation.updateMany({
      where: {
        agencyId: owner.agencyId,
        emailNormalized,
        status: "PENDING",
      },
      data: { status: "REVOKED" },
    })

    return tx.agencyInvitation.create({
      data: {
        agencyId: owner.agencyId,
        emailNormalized,
        invitedUserId: existingUser?.id,
        invitedById: input.ownerId,
        tokenHash,
        manualQuota,
        expiresAt,
      },
      include: { agency: { select: { name: true, slug: true } } },
    })
  })
  return { invitation, token: rawToken }
}

export async function getAgencyInvitationByToken(token: string) {
  const tokenHash = hashInvitationToken(token)
  return prisma.agencyInvitation.findUnique({
    where: { tokenHash },
    include: {
      agency: { select: { id: true, name: true, slug: true, logoUrl: true } },
      invitedBy: { select: { name: true } },
    },
  })
}

export async function acceptAgencyInvitation(input: {
  token: string
  userId: string
  userEmail: string
  now?: Date
}) {
  const now = input.now ?? new Date()
  const tokenHash = hashInvitationToken(input.token)
  const email = normalizeInvitationEmail(input.userEmail)

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`agency-invitation:${tokenHash}`}, 0))`
    const invitation = await tx.agencyInvitation.findUnique({
      where: { tokenHash },
      include: { agency: true },
    })
    if (!invitation) throw new Error("INVITATION_NOT_FOUND")
    if (invitation.status === "ACCEPTED") {
      const membership = await tx.agencyMembership.findFirst({
        where: {
          agencyId: invitation.agencyId,
          userId: input.userId,
          status: "ACTIVE",
        },
      })
      if (membership) return membership
      throw new Error("INVITATION_ALREADY_USED")
    }
    const validationError = invitationAcceptanceError({
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      invitedEmail: invitation.emailNormalized,
      signedInEmail: email,
      now,
    })
    if (validationError === "INVITATION_EXPIRED") {
      throw new Error("INVITATION_EXPIRED")
    }
    if (validationError) throw new Error(validationError)

    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`agency-user:${input.userId}`}, 0))`
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`agency-members:${invitation.agencyId}`}, 0))`
    const otherMembership = await tx.agencyMembership.findFirst({
      where: { userId: input.userId, status: "ACTIVE" },
      select: { agencyId: true },
    })
    if (otherMembership && otherMembership.agencyId !== invitation.agencyId) {
      throw new Error("USER_ALREADY_IN_AGENCY")
    }

    if (invitation.agency.quotaMode === "MANUAL") {
      const members = await tx.agencyMembership.findMany({
        where: { agencyId: invitation.agencyId, status: "ACTIVE" },
        select: { manualQuota: true },
      })
      const validation = validateManualAgencyQuotas([
        ...members.map((member) => member.manualQuota),
        invitation.manualQuota,
      ])
      if (!validation.ok) throw new Error("AGENCY_QUOTA_TOTAL_EXCEEDED")
    }

    const membership = await tx.agencyMembership.upsert({
      where: {
        agencyId_userId: {
          agencyId: invitation.agencyId,
          userId: input.userId,
        },
      },
      create: {
        agencyId: invitation.agencyId,
        userId: input.userId,
        role: "AGENT",
        status: "ACTIVE",
        manualQuota: invitation.manualQuota,
      },
      update: {
        role: "AGENT",
        status: "ACTIVE",
        manualQuota: invitation.manualQuota,
        joinedAt: now,
        leftAt: null,
      },
    })
    const accepted = await tx.agencyInvitation.updateMany({
      where: { id: invitation.id, status: "PENDING" },
      data: {
        status: "ACCEPTED",
        invitedUserId: input.userId,
        acceptedAt: now,
      },
    })
    if (accepted.count !== 1) throw new Error("INVITATION_ALREADY_USED")
    return membership
  })
}

export async function updateAgencyQuotas(input: {
  ownerId: string
  mode: "EQUAL" | "MANUAL"
  quotas: Record<string, number>
}) {
  return prisma.$transaction(async (tx) => {
    const owner = await requireAgencyOwner(input.ownerId, tx)
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`agency-capacity:${owner.agencyId}`}, 0))`
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`agency-members:${owner.agencyId}`}, 0))`
    const members = await tx.agencyMembership.findMany({
      where: { agencyId: owner.agencyId, status: "ACTIVE" },
      select: { id: true, userId: true, manualQuota: true },
    })
    if (input.mode === "MANUAL") {
      const values = members.map((member) =>
        Math.trunc(input.quotas[member.userId] ?? member.manualQuota)
      )
      const validation = validateManualAgencyQuotas(values)
      if (!validation.ok) throw new Error("AGENCY_QUOTA_TOTAL_EXCEEDED")
      await Promise.all(
        members.map((member, index) =>
          tx.agencyMembership.update({
            where: { id: member.id },
            data: { manualQuota: values[index] },
          })
        )
      )
    }
    await tx.agency.update({
      where: { id: owner.agencyId },
      data: { quotaMode: input.mode },
    })
  })
}

async function leaveMembership(
  tx: Prisma.TransactionClient,
  membership: { id: string; agencyId: string; userId: string; role: string }
) {
  if (membership.role === "OWNER") throw new Error("OWNER_CANNOT_LEAVE")
  await tx.agencyMembership.update({
    where: { id: membership.id },
    data: { status: "LEFT", leftAt: new Date() },
  })
  await tx.listing.updateMany({
    where: {
      agencyId: membership.agencyId,
      assignedAgentId: membership.userId,
    },
    data: { assignedAgentId: null },
  })
}

export async function leaveAgency(userId: string) {
  return prisma.$transaction(async (tx) => {
    const membership = await tx.agencyMembership.findFirst({
      where: { userId, status: "ACTIVE" },
    })
    if (!membership) throw new Error("AGENCY_MEMBERSHIP_REQUIRED")
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`agency-members:${membership.agencyId}`}, 0))`
    await leaveMembership(tx, membership)
  })
}

export async function removeAgencyAgent(input: {
  ownerId: string
  membershipId: string
}) {
  return prisma.$transaction(async (tx) => {
    const owner = await requireAgencyOwner(input.ownerId, tx)
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`agency-members:${owner.agencyId}`}, 0))`
    const membership = await tx.agencyMembership.findUnique({
      where: { id: input.membershipId },
    })
    if (!membership || membership.agencyId !== owner.agencyId) {
      throw new Error("AGENCY_MEMBER_NOT_FOUND")
    }
    await leaveMembership(tx, membership)
  })
}

export async function revokeAgencyInvitation(input: {
  ownerId: string
  invitationId: string
}) {
  return prisma.$transaction(async (tx) => {
    const owner = await requireAgencyOwner(input.ownerId, tx)
    const result = await tx.agencyInvitation.updateMany({
      where: {
        id: input.invitationId,
        agencyId: owner.agencyId,
        status: "PENDING",
      },
      data: { status: "REVOKED" },
    })
    if (result.count !== 1) throw new Error("INVITATION_NOT_PENDING")
  })
}

export async function reassignAgencyListing(input: {
  ownerId: string
  listingId: string
  assigneeUserId: string | null
}) {
  return prisma.$transaction(async (tx) => {
    const owner = await requireAgencyOwner(input.ownerId, tx)
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`agency-capacity:${owner.agencyId}`}, 0))`
    const listing = await tx.listing.findUnique({
      where: { id: input.listingId },
      select: { agencyId: true },
    })
    if (!listing || listing.agencyId !== owner.agencyId) {
      throw new Error("AGENCY_LISTING_NOT_FOUND")
    }
    if (input.assigneeUserId) {
      const assignee = await tx.agencyMembership.findFirst({
        where: {
          agencyId: owner.agencyId,
          userId: input.assigneeUserId,
          status: "ACTIVE",
        },
      })
      if (!assignee) throw new Error("AGENCY_MEMBER_NOT_FOUND")
      const agency = await tx.agency.findUnique({
        where: { id: owner.agencyId },
        select: {
          quotaMode: true,
          memberships: {
            where: { status: "ACTIVE" },
            select: { userId: true, manualQuota: true },
          },
        },
      })
      if (!agency) throw new Error("AGENCY_NOT_FOUND")
      const quota = resolveAgencyMemberQuotas({
        mode: agency.quotaMode,
        members: agency.memberships,
      })[input.assigneeUserId] ?? 0
      const used = await tx.listing.count({
        where: {
          agencyId: owner.agencyId,
          assignedAgentId: input.assigneeUserId,
          id: { not: input.listingId },
          status: { in: [...CAPACITY_STATUSES] },
        },
      })
      if (used >= quota) throw new Error("AGENCY_MEMBER_QUOTA_REACHED")
    }
    await tx.listing.update({
      where: { id: input.listingId },
      data: { assignedAgentId: input.assigneeUserId },
    })
  })
}

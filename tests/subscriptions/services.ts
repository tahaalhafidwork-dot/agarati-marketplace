import assert from "node:assert/strict"
import { loadEnvConfig } from "@next/env"
import { PrismaClient } from "@prisma/client"
import {
  assertAgencyPublishingCapacity,
  canManageAgencyListing,
  ensureAgencyForApprovedOwner,
} from "../../lib/agency-service"
import {
  acceptAgencyInvitation,
  acceptAgencyInvitationById,
  createAgencyInvitation,
  leaveAgency,
} from "../../lib/agency-membership-service"
import { countUnreadMessages } from "../../application/listings/messages/count-unread"
import { toPublicListingCard } from "../../lib/listings"
import {
  approvePaymentRequest,
  requestAgencySubscriptionPayment,
  requestIndividualListingPayment,
} from "../../lib/payment-service"

loadEnvConfig(process.cwd())
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error("DATABASE_URL is required")
const host = new URL(databaseUrl).hostname
if (!new Set(["127.0.0.1", "localhost", "::1"]).has(host)) {
  throw new Error(`Refusing service tests against non-local host: ${host}`)
}

const prisma = new PrismaClient()
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const ids = {
  owner: `svc-owner-${suffix}`,
  agent: `svc-agent-${suffix}`,
  invitee: `svc-invitee-${suffix}`,
  inboxInvitee: `svc-inbox-invitee-${suffix}`,
  commercialInvitee: `svc-commercial-invitee-${suffix}`,
  pendingInvitee: `svc-pending-invitee-${suffix}`,
  admin: `svc-admin-${suffix}`,
  agency: `svc-agency-${suffix}`,
}

const listingBase = {
  description: "Integration test",
  category: "APARTMENT" as const,
  deal: "SALE" as const,
  priceIqd: 1_000_000,
  citySlug: "baghdad",
  districtSlug: "test",
  neighborhoodSlug: "test",
}

async function cleanup() {
  await prisma.agencySubscription.deleteMany({ where: { agencyId: ids.agency } })
  await prisma.paymentRequest.deleteMany({
    where: { requestedById: { in: [ids.owner, ids.agent, ids.invitee, ids.inboxInvitee] } },
  })
  await prisma.listing.deleteMany({ where: { ownerId: { in: [ids.owner, ids.agent, ids.invitee, ids.inboxInvitee] } } })
  await prisma.agency.deleteMany({ where: { id: ids.agency } })
  await prisma.user.deleteMany({
    where: {
      id: {
        in: [
          ids.owner,
          ids.agent,
          ids.invitee,
          ids.inboxInvitee,
          ids.commercialInvitee,
          ids.pendingInvitee,
          ids.admin,
        ],
      },
    },
  })
}

async function run() {
  try {
    await prisma.user.createMany({
      data: [
        {
          id: ids.owner,
          email: `${ids.owner}@example.test`,
          name: "Owner",
          accountType: "AGENCY",
          agencyUpgradeStatus: "APPROVED",
        },
        { id: ids.agent, email: `${ids.agent}@example.test`, name: "Agent" },
        { id: ids.invitee, email: `${ids.invitee}@example.test`, name: "Invitee" },
        { id: ids.inboxInvitee, email: `${ids.inboxInvitee}@example.test`, name: "Inbox Invitee" },
        {
          id: ids.commercialInvitee,
          email: `${ids.commercialInvitee}@example.test`,
          name: "Commercial Invitee",
          accountType: "AGENCY",
          agencyUpgradeStatus: "APPROVED",
        },
        {
          id: ids.pendingInvitee,
          email: `${ids.pendingInvitee}@example.test`,
          name: "Pending Invitee",
        },
        { id: ids.admin, email: `${ids.admin}@example.test`, name: "Admin", role: "ADMIN" },
      ],
    })
    await prisma.agency.create({
      data: {
        id: ids.agency,
        slug: ids.agency,
        name: "Service Agency",
        status: "APPROVED",
        createdById: ids.owner,
        memberships: {
          create: [
            { userId: ids.owner, role: "OWNER", manualQuota: 15 },
            { userId: ids.agent, role: "AGENT", manualQuota: 15 },
          ],
        },
      },
    })
    const seedPayment = await prisma.paymentRequest.create({
      data: {
        idempotencyKey: `seed:${suffix}`,
        purpose: "AGENCY_SUBSCRIPTION",
        status: "APPROVED",
        amountIqd: 40_000,
        agencyId: ids.agency,
        requestedById: ids.owner,
        approvedById: ids.admin,
        externalReference: `seed-ref-${suffix}`,
        approvedAt: new Date(),
        appliedAt: new Date(),
      },
    })
    await prisma.agencySubscription.create({
      data: {
        agencyId: ids.agency,
        paymentId: seedPayment.id,
        startsAt: new Date(Date.now() - 60_000),
        endsAt: new Date(Date.now() + 86_400_000),
      },
    })

    assert.equal(
      (await ensureAgencyForApprovedOwner(ids.owner)).id,
      ids.agency
    )
    assert.equal(
      await prisma.agencyMembership.count({
        where: { userId: ids.owner, status: "ACTIVE", role: "OWNER" },
      }),
      1
    )

    await assert.rejects(
      () => ensureAgencyForApprovedOwner(ids.agent),
      /AGENCY_AGENT_CANNOT_OWN/
    )
    await assert.rejects(
      () =>
        createAgencyInvitation({
          ownerId: ids.owner,
          email: `${ids.commercialInvitee}@example.test`,
        }),
      /ACCOUNT_NOT_ELIGIBLE_AS_AGENT/
    )

    const pendingInvitation = await createAgencyInvitation({
      ownerId: ids.owner,
      email: `${ids.pendingInvitee}@example.test`,
    })
    await prisma.user.update({
      where: { id: ids.pendingInvitee },
      data: { agencyUpgradeStatus: "PENDING" },
    })
    await assert.rejects(
      () =>
        acceptAgencyInvitation({
          token: pendingInvitation.token,
          userId: ids.pendingInvitee,
          userEmail: `${ids.pendingInvitee}@example.test`,
        }),
      /ACCOUNT_NOT_ELIGIBLE_AS_AGENT/
    )

    const invitation = await createAgencyInvitation({
      ownerId: ids.owner,
      email: `${ids.invitee}@example.test`,
    })
    assert.notEqual(invitation.invitation.tokenHash, invitation.token)
    const accepted = await acceptAgencyInvitation({
      token: invitation.token,
      userId: ids.invitee,
      userEmail: `${ids.invitee}@example.test`,
    })
    assert.equal(accepted.role, "AGENT")
    assert.equal(
      (await prisma.user.findUniqueOrThrow({ where: { id: ids.invitee } }))
        .accountType,
      "INDIVIDUAL"
    )

    const inboxInvitation = await createAgencyInvitation({
      ownerId: ids.owner,
      email: `${ids.inboxInvitee}@example.test`,
    })
    assert.equal(await countUnreadMessages(ids.inboxInvitee), 1)
    const acceptedFromInbox = await acceptAgencyInvitationById({
      invitationId: inboxInvitation.invitation.id,
      userId: ids.inboxInvitee,
      userEmail: `${ids.inboxInvitee}@example.test`,
    })
    assert.equal(acceptedFromInbox.role, "AGENT")
    assert.equal(await countUnreadMessages(ids.inboxInvitee), 0)
    await leaveAgency(ids.inboxInvitee)
    const assigned = await prisma.listing.create({
      data: {
        ...listingBase,
        title: "Owned by agency",
        ownerId: ids.owner,
        agencyId: ids.agency,
        assignedAgentId: ids.invitee,
        billingKind: "AGENCY_INCLUDED",
      },
    })
    const attributedListing = await prisma.listing.findUniqueOrThrow({
      where: { id: assigned.id },
      include: {
        images: true,
        owner: { select: { id: true, name: true, phone: true, whatsapp: true } },
        agency: {
          select: {
            slug: true,
            name: true,
            phone: true,
            whatsapp: true,
            createdById: true,
          },
        },
        assignedAgent: { select: { id: true, name: true } },
      },
    })
    const attributedCard = toPublicListingCard(attributedListing)
    assert.equal(attributedCard.ownerName, "Owner")
    assert.equal(attributedCard.ownerKind, "agency")
    assert.equal(attributedCard.agencyRepresentativeName, "Invitee")
    assert.equal(attributedCard.agencyRepresentativeRole, "AGENT")
    await leaveAgency(ids.invitee)
    assert.equal(
      (await prisma.listing.findUniqueOrThrow({ where: { id: assigned.id } })).assignedAgentId,
      null
    )
    await prisma.listing.delete({ where: { id: assigned.id } })

    assert.equal(
      await canManageAgencyListing(ids.owner, {
        agencyId: ids.agency,
        assignedAgentId: ids.agent,
      }),
      true
    )
    assert.equal(
      await canManageAgencyListing(ids.invitee, {
        agencyId: ids.agency,
        assignedAgentId: ids.agent,
      }),
      false
    )

    const attempts = Array.from({ length: 31 }, (_, index) =>
      prisma.$transaction(async (tx) => {
        const userId = index % 2 === 0 ? ids.owner : ids.agent
        await assertAgencyPublishingCapacity(tx, {
          agencyId: ids.agency,
          userId,
        })
        return tx.listing.create({
          data: {
            ...listingBase,
            title: `Concurrent ${index}`,
            ownerId: ids.owner,
            agencyId: ids.agency,
            assignedAgentId: userId,
            billingKind: "AGENCY_INCLUDED",
            status: "PENDING",
          },
        })
      })
    )
    const settled = await Promise.allSettled(attempts)
    assert.equal(settled.filter((item) => item.status === "fulfilled").length, 30)
    assert.equal(settled.filter((item) => item.status === "rejected").length, 1)
    assert.equal(await prisma.listing.count({ where: { agencyId: ids.agency } }), 30)
    const firstCreated = settled.find((item) => item.status === "fulfilled")
    if (!firstCreated || firstCreated.status !== "fulfilled") {
      throw new Error("Expected a successful concurrent create")
    }
    await prisma.listing.delete({ where: { id: firstCreated.value.id } })
    const awaitingSubscription = await prisma.listing.create({
      data: {
        ...listingBase,
        title: "Awaiting subscription renewal",
        ownerId: ids.owner,
        agencyId: ids.agency,
        assignedAgentId: ids.owner,
        billingKind: "AGENCY_INCLUDED",
        billingState: "SUBSCRIPTION_REQUIRED",
        moderationApprovedAt: new Date(),
        status: "PENDING",
      },
    })

    const paidListing = await prisma.listing.create({
      data: {
        ...listingBase,
        title: "Paid personal listing",
        ownerId: ids.agent,
        billingKind: "PERSONAL_PAID",
        billingState: "PAYMENT_REQUIRED",
        moderationApprovedAt: new Date(),
        status: "PENDING",
      },
    })
    const firstRequest = await requestIndividualListingPayment(ids.agent, paidListing.id)
    const duplicateRequest = await requestIndividualListingPayment(ids.agent, paidListing.id)
    assert.equal(firstRequest.id, duplicateRequest.id)
    const applied = await approvePaymentRequest({
      paymentId: firstRequest.id,
      adminId: ids.admin,
      externalReference: `personal-ref-${suffix}`,
    })
    assert.equal(applied.alreadyApplied, false)
    const repeated = await approvePaymentRequest({
      paymentId: firstRequest.id,
      adminId: ids.admin,
      externalReference: `personal-ref-${suffix}`,
    })
    assert.equal(repeated.alreadyApplied, true)
    const published = await prisma.listing.findUniqueOrThrow({ where: { id: paidListing.id } })
    assert.equal(published.status, "ACTIVE")
    assert.equal(published.billingState, "READY")

    const agencyRequest = await requestAgencySubscriptionPayment(ids.owner)
    const agencyRequestAgain = await requestAgencySubscriptionPayment(ids.owner)
    assert.equal(agencyRequest.id, agencyRequestAgain.id)
    await approvePaymentRequest({
      paymentId: agencyRequest.id,
      adminId: ids.admin,
      externalReference: `agency-ref-${suffix}`,
    })
    const agencyRepeated = await approvePaymentRequest({
      paymentId: agencyRequest.id,
      adminId: ids.admin,
      externalReference: `agency-ref-${suffix}`,
    })
    assert.equal(agencyRepeated.alreadyApplied, true)
    assert.equal(
      (await prisma.listing.findUniqueOrThrow({ where: { id: awaitingSubscription.id } })).status,
      "ACTIVE"
    )
    assert.equal(
      await prisma.agencySubscription.count({ where: { agencyId: ids.agency } }),
      2
    )

    console.log("Subscription service integration OK")
  } finally {
    await cleanup()
    await prisma.$disconnect()
  }
}

void run()

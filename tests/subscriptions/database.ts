import assert from "node:assert/strict"
import { PrismaClient } from "@prisma/client"
import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd())
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error("DATABASE_URL is required")
const host = new URL(databaseUrl).hostname
if (!new Set(["127.0.0.1", "localhost", "::1"]).has(host)) {
  throw new Error(`Refusing subscription DB tests against non-local host: ${host}`)
}

const prisma = new PrismaClient()
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const ids = {
  owner: `test-owner-${suffix}`,
  agent: `test-agent-${suffix}`,
  other: `test-other-${suffix}`,
  agency: `test-agency-${suffix}`,
  secondAgency: `test-agency-2-${suffix}`,
}

async function expectDatabaseRejection(work: () => Promise<unknown>) {
  let rejected = false
  try {
    await work()
  } catch {
    rejected = true
  }
  assert.equal(rejected, true)
}

async function cleanup() {
  await prisma.agencySubscription.deleteMany({
    where: { agencyId: { in: [ids.agency, ids.secondAgency] } },
  })
  await prisma.paymentRequest.deleteMany({
    where: { requestedById: { in: [ids.owner, ids.agent, ids.other] } },
  })
  await prisma.listing.deleteMany({
    where: { ownerId: { in: [ids.owner, ids.agent, ids.other] } },
  })
  await prisma.agency.deleteMany({
    where: { id: { in: [ids.agency, ids.secondAgency] } },
  })
  await prisma.user.deleteMany({
    where: { id: { in: [ids.owner, ids.agent, ids.other] } },
  })
}

async function run() {
  try {
    await prisma.user.createMany({
      data: [
        { id: ids.owner, email: `${ids.owner}@example.test`, name: "Owner" },
        { id: ids.agent, email: `${ids.agent}@example.test`, name: "Agent" },
        { id: ids.other, email: `${ids.other}@example.test`, name: "Other" },
      ],
    })
    await prisma.agency.createMany({
      data: [
        { id: ids.agency, slug: ids.agency, name: "Agency", status: "APPROVED", createdById: ids.owner },
        { id: ids.secondAgency, slug: ids.secondAgency, name: "Agency 2", status: "APPROVED", createdById: ids.other },
      ],
    })
    await prisma.agencyMembership.create({
      data: { agencyId: ids.agency, userId: ids.owner, role: "OWNER", manualQuota: 30 },
    })
    await expectDatabaseRejection(() =>
      prisma.agencyMembership.create({
        data: { agencyId: ids.agency, userId: ids.other, role: "OWNER" },
      })
    )

    await prisma.agencyMembership.create({
      data: { agencyId: ids.agency, userId: ids.agent, role: "AGENT" },
    })
    await expectDatabaseRejection(() =>
      prisma.agencyMembership.create({
        data: { agencyId: ids.secondAgency, userId: ids.agent, role: "AGENT" },
      })
    )
    await expectDatabaseRejection(() =>
      prisma.agencyMembership.update({
        where: { agencyId_userId: { agencyId: ids.agency, userId: ids.agent } },
        data: { manualQuota: 31 },
      })
    )

    const listingBase = {
      title: "Test listing",
      description: "Test",
      category: "APARTMENT" as const,
      deal: "SALE" as const,
      priceIqd: 1_000_000,
      citySlug: "baghdad",
      districtSlug: "test",
      neighborhoodSlug: "test",
      ownerId: ids.agent,
    }
    await prisma.listing.create({ data: listingBase })
    await expectDatabaseRejection(() =>
      prisma.listing.create({ data: { ...listingBase, title: "Second free" } })
    )
    await expectDatabaseRejection(() =>
      prisma.listing.create({
        data: {
          ...listingBase,
          title: "Invalid agency billing",
          agencyId: ids.agency,
          billingKind: "PERSONAL_PAID",
        },
      })
    )

    await expectDatabaseRejection(() =>
      prisma.paymentRequest.create({
        data: {
          idempotencyKey: `wrong-price-${suffix}`,
          purpose: "AGENCY_SUBSCRIPTION",
          amountIqd: 1,
          agencyId: ids.agency,
          requestedById: ids.owner,
        },
      })
    )
    await prisma.paymentRequest.create({
      data: {
        idempotencyKey: `valid-${suffix}`,
        purpose: "AGENCY_SUBSCRIPTION",
        amountIqd: 40_000,
        agencyId: ids.agency,
        requestedById: ids.owner,
      },
    })
    await expectDatabaseRejection(() =>
      prisma.paymentRequest.create({
        data: {
          idempotencyKey: `valid-${suffix}`,
          purpose: "AGENCY_SUBSCRIPTION",
          amountIqd: 40_000,
          agencyId: ids.agency,
          requestedById: ids.owner,
        },
      })
    )

    console.log("Subscription database constraints OK")
  } finally {
    await cleanup()
    await prisma.$disconnect()
  }
}

void run()

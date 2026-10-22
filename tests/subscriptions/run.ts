import assert from "node:assert/strict"

import {
  AGENCY_ACTIVE_LISTING_LIMIT,
  AGENCY_SUBSCRIPTION_DAYS,
  AGENCY_SUBSCRIPTION_PRICE_IQD,
  INDIVIDUAL_ACTIVE_LISTING_LIMIT,
  INDIVIDUAL_PAID_LISTING_PRICE_IQD,
  LISTING_TERM_DAYS,
  addUtcDays,
  agencySubscriptionPaymentIdempotencyKey,
  computeEqualAgencyQuotas,
  isPeriodActive,
  listingPaymentIdempotencyKey,
  nextTermStart,
  validateManualAgencyQuotas,
} from "../../lib/billing-policy"
import {
  invitationAcceptanceError,
  mayManageAgencyListing,
  nextPersonalBillingKind,
} from "../../lib/agency-policy"
import { resolveAccountIdentity } from "../../lib/account-identity"

function run() {
  assert.equal(INDIVIDUAL_ACTIVE_LISTING_LIMIT, 3)
  assert.equal(AGENCY_ACTIVE_LISTING_LIMIT, 30)
  assert.equal(INDIVIDUAL_PAID_LISTING_PRICE_IQD, 5_000)
  assert.equal(AGENCY_SUBSCRIPTION_PRICE_IQD, 40_000)
  assert.equal(LISTING_TERM_DAYS, 60)
  assert.equal(AGENCY_SUBSCRIPTION_DAYS, 30)

  assert.equal(
    resolveAccountIdentity({
      accountType: "INDIVIDUAL",
    }),
    "INDIVIDUAL"
  )
  assert.equal(
    resolveAccountIdentity({
      accountType: "INDIVIDUAL",
      agencyMembershipRole: "AGENT",
    }),
    "AGENT"
  )
  assert.equal(
    resolveAccountIdentity({
      accountType: "AGENCY",
      agencyMembershipRole: "OWNER",
    }),
    "AGENCY"
  )

  assert.equal(nextPersonalBillingKind(false), "PERSONAL_FREE")
  assert.equal(nextPersonalBillingKind(true), "PERSONAL_PAID")

  assert.deepEqual(computeEqualAgencyQuotas(["b", "a"]), { a: 15, b: 15 })
  const four = computeEqualAgencyQuotas(["d", "b", "a", "c"])
  assert.deepEqual(four, { a: 8, b: 8, c: 7, d: 7 })
  assert.equal(Object.values(four).reduce((sum, value) => sum + value, 0), 30)
  assert.deepEqual(computeEqualAgencyQuotas(["a", "a", "b"]), { a: 15, b: 15 })
  assert.equal(validateManualAgencyQuotas([10, 10, 10]).ok, true)
  assert.equal(validateManualAgencyQuotas([16, 15]).ok, false)
  assert.equal(validateManualAgencyQuotas([-1, 1]).ok, false)

  const now = new Date("2026-10-19T12:00:00.000Z")
  assert.equal(addUtcDays(now, 60).toISOString(), "2026-12-18T12:00:00.000Z")
  const futureEnd = new Date("2026-11-01T00:00:00.000Z")
  assert.equal(nextTermStart(futureEnd, now).toISOString(), futureEnd.toISOString())
  assert.equal(nextTermStart(new Date("2026-10-01T00:00:00.000Z"), now).toISOString(), now.toISOString())
  assert.equal(isPeriodActive(now, futureEnd, now), true)
  assert.equal(isPeriodActive(now, futureEnd, futureEnd), false)
  assert.equal(
    listingPaymentIdempotencyKey({ id: "listing-1", expiresAt: null }),
    "listing:listing-1:initial"
  )
  assert.notEqual(
    listingPaymentIdempotencyKey({ id: "listing-1", expiresAt: futureEnd }),
    listingPaymentIdempotencyKey({ id: "listing-1", expiresAt: null })
  )
  assert.equal(
    agencySubscriptionPaymentIdempotencyKey("agency-1", null),
    "agency:agency-1:initial"
  )

  assert.equal(
    mayManageAgencyListing({
      userId: "owner",
      assignedAgentId: "agent",
      membership: { role: "OWNER", status: "ACTIVE" },
    }),
    true
  )
  assert.equal(
    mayManageAgencyListing({
      userId: "agent",
      assignedAgentId: "agent",
      membership: { role: "AGENT", status: "ACTIVE" },
    }),
    true
  )
  assert.equal(
    mayManageAgencyListing({
      userId: "other",
      assignedAgentId: "agent",
      membership: { role: "AGENT", status: "ACTIVE" },
    }),
    false
  )
  assert.equal(
    mayManageAgencyListing({
      userId: "agent",
      assignedAgentId: "agent",
      membership: { role: "AGENT", status: "LEFT" },
    }),
    false
  )

  const invite = {
    status: "PENDING" as const,
    expiresAt: addUtcDays(now, 7),
    invitedEmail: "agent@example.com",
    signedInEmail: "AGENT@example.com",
    now,
  }
  assert.equal(invitationAcceptanceError(invite), null)
  assert.equal(
    invitationAcceptanceError({ ...invite, signedInEmail: "wrong@example.com" }),
    "INVITATION_EMAIL_MISMATCH"
  )
  assert.equal(
    invitationAcceptanceError({ ...invite, now: invite.expiresAt }),
    "INVITATION_EXPIRED"
  )
  assert.equal(
    invitationAcceptanceError({ ...invite, status: "REVOKED" }),
    "INVITATION_NOT_PENDING"
  )

  console.log("Subscription and agency policy tests OK")
}

run()

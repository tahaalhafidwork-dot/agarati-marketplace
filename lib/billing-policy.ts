import type { AgencyQuotaMode } from "@prisma/client"

export const INDIVIDUAL_ACTIVE_LISTING_LIMIT = 3
export const AGENCY_ACTIVE_LISTING_LIMIT = 30
export const INDIVIDUAL_PAID_LISTING_PRICE_IQD = 5_000
export const AGENCY_SUBSCRIPTION_PRICE_IQD = 40_000
export const LISTING_TERM_DAYS = 60
export const AGENCY_SUBSCRIPTION_DAYS = 30

export const CAPACITY_STATUSES = ["PENDING", "ACTIVE"] as const

export function listingPaymentIdempotencyKey(input: {
  id: string
  expiresAt: Date | null
}): string {
  return `listing:${input.id}:${input.expiresAt?.toISOString() ?? "initial"}`
}

export function agencySubscriptionPaymentIdempotencyKey(
  agencyId: string,
  currentEnd: Date | null | undefined
): string {
  return `agency:${agencyId}:${currentEnd?.toISOString() ?? "initial"}`
}

export function addUtcDays(from: Date, days: number): Date {
  const next = new Date(from)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export function nextTermStart(
  currentEnd: Date | null | undefined,
  now: Date = new Date()
): Date {
  return currentEnd && currentEnd > now ? new Date(currentEnd) : new Date(now)
}

export function isPeriodActive(
  startsAt: Date,
  endsAt: Date,
  now: Date = new Date()
): boolean {
  return startsAt <= now && endsAt > now
}

/**
 * Stable equal distribution: members are sorted by id and the remainder is
 * assigned one-by-one. The total is always exactly the agency limit.
 */
export function computeEqualAgencyQuotas(
  memberIds: readonly string[],
  limit = AGENCY_ACTIVE_LISTING_LIMIT
): Record<string, number> {
  const ids = [...new Set(memberIds)].sort((a, b) => a.localeCompare(b))
  if (ids.length === 0) return {}
  const base = Math.floor(limit / ids.length)
  let remainder = limit % ids.length
  return Object.fromEntries(
    ids.map((id) => {
      const quota = base + (remainder > 0 ? 1 : 0)
      remainder = Math.max(0, remainder - 1)
      return [id, quota]
    })
  )
}

export function resolveAgencyMemberQuotas(input: {
  mode: AgencyQuotaMode
  members: readonly { userId: string; manualQuota: number }[]
}): Record<string, number> {
  if (input.mode === "EQUAL") {
    return computeEqualAgencyQuotas(input.members.map((member) => member.userId))
  }
  return Object.fromEntries(
    input.members.map((member) => [
      member.userId,
      Math.max(0, Math.min(AGENCY_ACTIVE_LISTING_LIMIT, member.manualQuota)),
    ])
  )
}

export function validateManualAgencyQuotas(
  quotas: readonly number[],
  limit = AGENCY_ACTIVE_LISTING_LIMIT
): { ok: true; total: number } | { ok: false; total: number; error: string } {
  const normalized = quotas.map((quota) => Math.trunc(quota))
  if (normalized.some((quota) => quota < 0 || quota > limit)) {
    return {
      ok: false,
      total: normalized.reduce((sum, quota) => sum + Math.max(0, quota), 0),
      error: "يجب أن تكون كل حصة بين 0 و30 إعلانًا.",
    }
  }
  const total = normalized.reduce((sum, quota) => sum + quota, 0)
  if (total > limit) {
    return {
      ok: false,
      total,
      error: `مجموع حصص الوكالة ${total} ويتجاوز الحد الإجمالي ${limit}.`,
    }
  }
  return { ok: true, total }
}

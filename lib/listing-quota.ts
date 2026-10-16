import type { AccountType, AgencyUpgradeStatus } from "@prisma/client"
import { PHASE_PRODUCTION_BUILD } from "next/constants"

import { prisma } from "@/lib/db"

/** Max active inventory for individual listers (draft + pending + live). */
export const INDIVIDUAL_LISTING_LIMIT = 3

/** Max active inventory for approved agencies. */
export const AGENCY_LISTING_LIMIT = 12

/** Public visibility window from publishedAt. */
export const LISTING_VISIBLE_DAYS = 90

export function listingQuotaLimit(opts: {
  accountType: AccountType
  agencyUpgradeStatus: AgencyUpgradeStatus
}): number {
  if (
    opts.accountType === "AGENCY" ||
    opts.agencyUpgradeStatus === "APPROVED"
  ) {
    return AGENCY_LISTING_LIMIT
  }
  return INDIVIDUAL_LISTING_LIMIT
}

/** Statuses that consume listing quota (paused still counts). */
export const QUOTA_STATUSES = ["DRAFT", "PENDING", "ACTIVE"] as const

export function computeExpiresAt(from: Date = new Date()): Date {
  const expires = new Date(from)
  expires.setDate(expires.getDate() + LISTING_VISIBLE_DAYS)
  return expires
}

/** Prisma filter: publicly browsable ACTIVE listings. */
export function publicListingVisibilityWhere(now: Date = new Date()) {
  return {
    status: "ACTIVE" as const,
    visibilityPaused: false,
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  }
}

export async function countQuotaListings(ownerId: string): Promise<number> {
  const now = new Date()
  return prisma.listing.count({
    where: {
      ownerId,
      status: { in: [...QUOTA_STATUSES] },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  })
}

export async function assertListingQuota(
  ownerId: string,
  opts: {
    accountType: AccountType
    agencyUpgradeStatus: AgencyUpgradeStatus
  }
): Promise<{ ok: true; used: number; limit: number } | { ok: false; error: string }> {
  const limit = listingQuotaLimit(opts)
  const used = await countQuotaListings(ownerId)
  if (used >= limit) {
    return {
      ok: false,
      error: `وصلت إلى الحد الأقصى للإعلانات (${used}/${limit}). احذف إعلاناً أو انتظر انتهاء أحدها قبل إضافة جديد.`,
    }
  }
  return { ok: true, used, limit }
}

/** Remaining whole days until expiresAt (0 if expired / missing). */
export function remainingVisibilityDays(
  expiresAt: Date | null | undefined,
  now: Date = new Date()
): number | null {
  if (!expiresAt) return null
  const ms = expiresAt.getTime() - now.getTime()
  if (ms <= 0) return 0
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export function formatRemainingDaysAr(days: number | null): string {
  if (days === null) return ""
  if (days <= 0) return "منتهٍ"
  if (days === 1) return "متبقّي يوم واحد"
  if (days === 2) return "متبقّي يومان"
  if (days >= 3 && days <= 10) return `متبقّي ${days} أيام`
  return `متبقّي ${days} يوماً`
}

/**
 * Lazy expire: flip ACTIVE rows past expiresAt to EXPIRED.
 * Throttled for global sweeps so home/browse don't run updateMany 4× per request.
 */
const globalForExpire = globalThis as unknown as {
  listingExpireAt?: number
}
const EXPIRE_SWEEP_TTL_MS = 60_000

export async function expireOverdueListings(opts?: {
  ownerId?: string
  listingId?: string
}): Promise<number> {
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return 0

  const scoped = Boolean(opts?.ownerId || opts?.listingId)
  if (!scoped) {
    const now = Date.now()
    const last = globalForExpire.listingExpireAt ?? 0
    if (now - last < EXPIRE_SWEEP_TTL_MS) return 0
    globalForExpire.listingExpireAt = now
  }

  const now = new Date()
  const result = await prisma.listing.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: now },
      ...(opts?.ownerId ? { ownerId: opts.ownerId } : {}),
      ...(opts?.listingId ? { id: opts.listingId } : {}),
    },
    data: { status: "EXPIRED" },
  })
  return result.count
}

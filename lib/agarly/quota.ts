import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/db"
import type { AgarlyFilters } from "@/lib/agarly/schema"

export const AGARLY_QUOTA_LIMIT = 10
export const AGARLY_QUOTA_WINDOW_MS = 3 * 60 * 60 * 1000

export type AgarlyUsageRecord = {
  requestId: string
  userId: string
  status: "PROCESSING" | "COMPLETED" | "FAILED"
  filters: unknown
  createdAt: Date
}

export type AgarlyQuotaTransaction = {
  findByRequestId(requestId: string): Promise<AgarlyUsageRecord | null>
  countSince(userId: string, since: Date): Promise<number>
  oldestSince(userId: string, since: Date): Promise<{ createdAt: Date } | null>
  create(input: {
    requestId: string
    userId: string
    promptHash: string
    provider: string
    model: string
    createdAt: Date
  }): Promise<AgarlyUsageRecord>
}

export type AgarlyQuotaStore = {
  withUserLock<T>(
    userId: string,
    callback: (transaction: AgarlyQuotaTransaction) => Promise<T>,
  ): Promise<T>
}

export type QuotaSnapshot = {
  limit: number
  used: number
  remaining: number
  resetAt: string | null
}

export type ReserveResult =
  | { kind: "reserved"; usage: AgarlyUsageRecord; quota: QuotaSnapshot }
  | { kind: "duplicate"; usage: AgarlyUsageRecord; quota: QuotaSnapshot }
  | { kind: "limited"; quota: QuotaSnapshot }

function snapshot(used: number, oldest: Date | null): QuotaSnapshot {
  return {
    limit: AGARLY_QUOTA_LIMIT,
    used,
    remaining: Math.max(0, AGARLY_QUOTA_LIMIT - used),
    resetAt: oldest
      ? new Date(oldest.getTime() + AGARLY_QUOTA_WINDOW_MS).toISOString()
      : null,
  }
}

export async function reserveAgarlyRequest(
  store: AgarlyQuotaStore,
  input: {
    requestId: string
    userId: string
    promptHash: string
    provider: string
    model: string
    now?: Date
  },
): Promise<ReserveResult> {
  const now = input.now ?? new Date()
  const since = new Date(now.getTime() - AGARLY_QUOTA_WINDOW_MS)
  return store.withUserLock(input.userId, async (transaction) => {
    const duplicate = await transaction.findByRequestId(input.requestId)
    const used = await transaction.countSince(input.userId, since)
    const oldest = await transaction.oldestSince(input.userId, since)
    const quota = snapshot(used, oldest?.createdAt ?? null)

    if (duplicate) return { kind: "duplicate", usage: duplicate, quota }
    if (used >= AGARLY_QUOTA_LIMIT) return { kind: "limited", quota }

    const usage = await transaction.create({ ...input, createdAt: now })
    return {
      kind: "reserved",
      usage,
      quota: snapshot(used + 1, oldest?.createdAt ?? now),
    }
  })
}

export const prismaAgarlyQuotaStore: AgarlyQuotaStore = {
  async withUserLock<T>(userId: string, callback: (tx: AgarlyQuotaTransaction) => Promise<T>) {
    return prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`
          SELECT 1::integer AS "locked"
          FROM pg_advisory_xact_lock(hashtextextended(${`agarly:${userId}`}, 0))
        `
        const adapter: AgarlyQuotaTransaction = {
          async findByRequestId(requestId) {
            return tx.agarlySearchUsage.findUnique({
              where: { requestId },
              select: {
                requestId: true,
                userId: true,
                status: true,
                filters: true,
                createdAt: true,
              },
            })
          },
          countSince(subjectId, since) {
            return tx.agarlySearchUsage.count({
              where: { userId: subjectId, createdAt: { gte: since } },
            })
          },
          oldestSince(subjectId, since) {
            return tx.agarlySearchUsage.findFirst({
              where: { userId: subjectId, createdAt: { gte: since } },
              orderBy: { createdAt: "asc" },
              select: { createdAt: true },
            })
          },
          create(data) {
            return tx.agarlySearchUsage.create({
              data,
              select: {
                requestId: true,
                userId: true,
                status: true,
                filters: true,
                createdAt: true,
              },
            })
          },
        }
        return callback(adapter)
      },
      { maxWait: 5_000, timeout: 8_000 },
    )
  },
}

export async function getAgarlyQuotaSnapshot(
  userId: string,
  now = new Date(),
): Promise<QuotaSnapshot> {
  const since = new Date(now.getTime() - AGARLY_QUOTA_WINDOW_MS)
  const [used, oldest] = await Promise.all([
    prisma.agarlySearchUsage.count({ where: { userId, createdAt: { gte: since } } }),
    prisma.agarlySearchUsage.findFirst({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
  ])
  return snapshot(used, oldest?.createdAt ?? null)
}

export async function completeAgarlyUsage(requestId: string, filters: AgarlyFilters) {
  await prisma.agarlySearchUsage.update({
    where: { requestId },
    data: {
      status: "COMPLETED",
      filters: filters as unknown as Prisma.InputJsonValue,
      completedAt: new Date(),
      errorCode: null,
    },
  })
}

export async function failAgarlyUsage(requestId: string, errorCode: string) {
  await prisma.agarlySearchUsage.updateMany({
    where: { requestId, status: "PROCESSING" },
    data: {
      status: "FAILED",
      errorCode: errorCode.slice(0, 80),
      completedAt: new Date(),
    },
  })
}

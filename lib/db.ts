import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  dbReachable?: boolean
  dbReachableCheckedAt?: number
}

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createClient()

// Always reuse on the serverless isolate (Vercel). Skipping this in production
// forced a new PrismaClient + TCP handshake on every request (~1–2s).
globalForPrisma.prisma = prisma

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim()
  if (!url) return false
  // Ignore placeholder localhost URLs used only for prisma generate
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    return process.env.DATABASE_LIVE === "1"
  }
  return true
}

const REACHABILITY_TTL_MS = 30_000
const REACHABILITY_TIMEOUT_MS = 1_200

/**
 * Fast probe with short timeout + negative cache.
 * On Vercel/production the DATABASE_URL is real — skip the extra SELECT 1
 * (it added cold-start latency on every public page).
 */
export async function isDatabaseReachable(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false

  // Production / Vercel: trust configured URL; probe only locally.
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return true
  }

  const now = Date.now()
  const cached = globalForPrisma.dbReachable
  const checkedAt = globalForPrisma.dbReachableCheckedAt ?? 0
  if (cached !== undefined && now - checkedAt < REACHABILITY_TTL_MS) {
    return cached
  }

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("DB_REACHABILITY_TIMEOUT")),
          REACHABILITY_TIMEOUT_MS
        )
      }),
    ])
    globalForPrisma.dbReachable = true
  } catch {
    globalForPrisma.dbReachable = false
  }
  globalForPrisma.dbReachableCheckedAt = Date.now()
  return Boolean(globalForPrisma.dbReachable)
}

/** Force re-probe on next call (e.g. after successful migrate). */
export function resetDatabaseReachabilityCache() {
  globalForPrisma.dbReachable = undefined
  globalForPrisma.dbReachableCheckedAt = undefined
}

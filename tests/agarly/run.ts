import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

import { AgarlyProviderError, createKiloProvider, getConfiguredAgarlyProvider } from "../../lib/agarly/provider"
import { AgarlyRequestBodyError, readAgarlyJsonBody } from "../../lib/agarly/http"
import { sanitizePromptForProvider } from "../../lib/agarly/prompt"
import {
  AGARLY_QUOTA_LIMIT,
  reserveAgarlyRequest,
  type AgarlyQuotaStore,
  type AgarlyQuotaTransaction,
  type AgarlyUsageRecord,
} from "../../lib/agarly/quota"
import { normalizeAgarlyFilters } from "../../lib/agarly/schema"
import {
  buildAgarlyAgencyWhere,
  buildAgarlyListingWhere,
  buildAgarlyProjectWhere,
} from "../../lib/agarly/search"

class MemoryQuotaStore implements AgarlyQuotaStore {
  records: AgarlyUsageRecord[] = []
  private tails = new Map<string, Promise<void>>()

  async withUserLock<T>(userId: string, callback: (tx: AgarlyQuotaTransaction) => Promise<T>) {
    const previous = this.tails.get(userId) ?? Promise.resolve()
    let release!: () => void
    const current = new Promise<void>((resolve) => { release = resolve })
    this.tails.set(userId, previous.then(() => current))
    await previous
    try {
      const tx: AgarlyQuotaTransaction = {
        findByRequestId: async (requestId) => this.records.find((row) => row.requestId === requestId) ?? null,
        countSince: async (subjectId, since) => this.records.filter((row) => row.userId === subjectId && row.createdAt >= since).length,
        oldestSince: async (subjectId, since) => {
          const row = this.records
            .filter((item) => item.userId === subjectId && item.createdAt >= since)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0]
          return row ? { createdAt: row.createdAt } : null
        },
        create: async (input) => {
          const row: AgarlyUsageRecord = {
            requestId: input.requestId,
            userId: input.userId,
            status: "PROCESSING",
            filters: null,
            createdAt: input.createdAt,
          }
          this.records.push(row)
          return row
        },
      }
      return await callback(tx)
    } finally {
      release()
    }
  }
}

async function run() {
  const filters = normalizeAgarlyFilters({
    intent: "mixed",
    category: "apartment",
    deal: "sale",
    city: "أربيل",
    district: "مركز أربيل",
    minPriceIqd: 200_000_000,
    maxPriceIqd: 100_000_000,
    rooms: 3,
    services: ["مصعد", "مصعد"],
  })
  assert.equal(filters.city, "erbil")
  assert.equal(filters.district, "erbil-center")
  assert.equal(filters.minPriceIqd, 100_000_000)
  assert.equal(filters.maxPriceIqd, 200_000_000)
  assert.deepEqual(filters.services, ["مصعد"])
  assert.throws(() => normalizeAgarlyFilters({ category: "castle" }))

  const sanitized = sanitizePromptForProvider("شقة ٣ غرف، اتصل 07701234567 أو me@example.com")
  assert.match(sanitized, /3 غرف/)
  assert.doesNotMatch(sanitized, /07701234567|me@example\.com/)

  await assert.rejects(
    readAgarlyJsonBody(
      new Request("https://agarati.example/api/agarly/search", {
        method: "POST",
        body: JSON.stringify({ prompt: "x".repeat(9_000) }),
      }),
    ),
    (error: unknown) =>
      error instanceof AgarlyRequestBodyError && error.code === "BODY_TOO_LARGE",
  )

  const listingWhere = buildAgarlyListingWhere(filters)
  const listingJson = JSON.stringify(listingWhere)
  assert.match(listingJson, /"status":"ACTIVE"/)
  assert.match(listingJson, /"visibilityPaused":false/)
  assert.match(listingJson, /"expiresAt"/)
  assert.match(listingJson, /"subscriptions"/)
  assert.equal(buildAgarlyProjectWhere(filters).status, "APPROVED")
  assert.equal(buildAgarlyAgencyWhere(filters, null).status, "APPROVED")
  assert.deepEqual(buildAgarlyAgencyWhere(filters, []).id, { in: [] })

  const store = new MemoryQuotaStore()
  const now = new Date("2026-10-21T12:00:00.000Z")
  const concurrent = await Promise.all(
    Array.from({ length: 20 }, (_, index) =>
      reserveAgarlyRequest(store, {
        requestId: `request-${index}`,
        userId: "user-1",
        promptHash: "hash",
        provider: "kilo",
        model: "kilo-auto/free",
        now,
      }),
    ),
  )
  assert.equal(concurrent.filter((result) => result.kind === "reserved").length, AGARLY_QUOTA_LIMIT)
  assert.equal(concurrent.filter((result) => result.kind === "limited").length, 10)
  const replay = await reserveAgarlyRequest(store, {
    requestId: "request-0", userId: "user-1", promptHash: "hash", provider: "kilo", model: "kilo-auto/free", now,
  })
  assert.equal(replay.kind, "duplicate")
  assert.equal(store.records.length, AGARLY_QUOTA_LIMIT)

  const oldProvider = process.env.AI_PROVIDER
  const oldKiloKey = process.env.KILO_API_KEY
  process.env.AI_PROVIDER = "kilo"
  process.env.KILO_API_KEY = "test-key"
  assert.equal(getConfiguredAgarlyProvider().name, "kilo")
  delete process.env.KILO_API_KEY
  assert.throws(() => getConfiguredAgarlyProvider(), AgarlyProviderError)
  if (oldProvider === undefined) delete process.env.AI_PROVIDER
  else process.env.AI_PROVIDER = oldProvider
  if (oldKiloKey === undefined) delete process.env.KILO_API_KEY
  else process.env.KILO_API_KEY = oldKiloKey

  const previousFetch = globalThis.fetch
  globalThis.fetch = async () => new Response("{}", { status: 503 })
  await assert.rejects(
    createKiloProvider("test-key").extractFilters("شقة في أربيل", new AbortController().signal),
    (error: unknown) => error instanceof AgarlyProviderError && error.code === "UNAVAILABLE",
  )
  globalThis.fetch = previousFetch

  const ui = await readFile("components/agarly/agarly-search-experience.tsx", "utf8")
  assert.match(ui, /sm:grid-cols-2/)
  assert.match(ui, /lg:grid-cols-3/)
  assert.match(ui, /BrowseListingsMapLazy/)
  assert.match(ui, /\/api\/agarly\/results/)

  console.log("Agarly AI extraction, privacy, visibility, quota, provider and UI contracts OK")
}

void run()

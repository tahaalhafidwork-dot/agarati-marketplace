import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

import { AgarlyProviderError, createKiloProvider, getConfiguredAgarlyProvider } from "../../lib/agarly/provider"
import { AgarlyRequestBodyError, readAgarlyJsonBody } from "../../lib/agarly/http"
import {
  applyPromptPriceHints,
  buildAgarlyClarification,
  parseIraqiPriceExpression,
  sanitizePromptForProvider,
} from "../../lib/agarly/prompt"
import {
  AGARLY_QUOTA_LIMIT,
  reserveAgarlyRequest,
  type AgarlyQuotaStore,
  type AgarlyQuotaTransaction,
  type AgarlyUsageRecord,
} from "../../lib/agarly/quota"
import { normalizeAgarlyFilters, parseStoredAgarlyOutcome } from "../../lib/agarly/schema"
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
  assert.equal(parseIraqiPriceExpression("٣٠٠ مليون"), 300_000_000)
  assert.equal(parseIraqiPriceExpression("1٫5 مليار"), 1_500_000_000)
  assert.equal(parseIraqiPriceExpression("750 ألف"), 750_000)
  const emptyFilters = normalizeAgarlyFilters({ intent: "listings" })
  assert.equal(
    applyPromptPriceHints(emptyFilters, "فيلا بسعر أقل من ٣٠٠ مليون دينار").maxPriceIqd,
    300_000_000,
  )
  assert.equal(
    applyPromptPriceHints(emptyFilters, "شقة مساحتها حتى 200 متر").maxPriceIqd,
    null,
  )
  const guardedFilters = applyPromptPriceHints(
    { ...emptyFilters, deal: "rent", maxPriceIqd: 180_000 },
    "شقة للبيع في أربيل بثلاث غرف وبسعر أقل من 180 مليون دينار",
  )
  assert.equal(guardedFilters.category, "apartment")
  assert.equal(guardedFilters.deal, "sale")
  assert.equal(guardedFilters.city, "erbil")
  assert.equal(guardedFilters.rooms, 3)
  assert.equal(guardedFilters.maxPriceIqd, 180_000_000)

  const broadErbil = applyPromptPriceHints(
    { ...emptyFilters, intent: "agencies" },
    "ابحث عن عقارات في أربيل",
  )
  assert.equal(broadErbil.intent, "mixed")
  assert.equal(broadErbil.city, "erbil")

  const mosulHouse = applyPromptPriceHints(emptyFilters, "أريد منزل في الموصل")
  assert.equal(mosulHouse.intent, "mixed")
  assert.equal(mosulHouse.category, "house")
  assert.equal(mosulHouse.deal, null)
  assert.equal(mosulHouse.city, "ninwa")
  assert.equal(mosulHouse.district, "mosul")

  const agencySearch = applyPromptPriceHints(emptyFilters, "أريد مكتبًا عقاريًا في أربيل")
  assert.equal(agencySearch.intent, "agencies")

  const safeKeywords = applyPromptPriceHints(
    { ...emptyFilters, keywords: ["الموصل", "مسبح"] },
    "أريد منزلًا مع مسبح في الموصل",
  )
  assert.deepEqual(safeKeywords.keywords, ["مسبح"])

  const iraqiDialect = applyPromptPriceHints(emptyFilters, "دورلي دار آجار بهولير")
  assert.equal(iraqiDialect.category, "house")
  assert.equal(iraqiDialect.deal, "rent")
  assert.equal(iraqiDialect.city, "erbil")

  const ambiguousNeighborhood = normalizeAgarlyFilters({
    intent: "mixed",
    neighborhood: "المهندسين",
  })
  assert.equal(ambiguousNeighborhood.city, null)
  assert.equal(ambiguousNeighborhood.neighborhood, null)
  const clarifiedNeighborhood = normalizeAgarlyFilters({
    intent: "mixed",
    district: "الموصل",
    neighborhood: "المهندسين",
  })
  assert.equal(clarifiedNeighborhood.city, "ninwa")
  assert.equal(clarifiedNeighborhood.district, "mosul")
  assert.equal(clarifiedNeighborhood.neighborhood, "al-muhandisiyyin")

  const clarification = buildAgarlyClarification("أريد بيتًا في حي المهندسين")
  assert.ok(clarification)
  assert.ok(clarification.options.length > 1)
  assert.ok(clarification.options.length <= 3)
  assert.equal(buildAgarlyClarification("أريد بيتًا في حي المهندسين في الموصل"), null)
  assert.equal(buildAgarlyClarification("أريد بيتًا في حي المهندسين في كربلاء"), null)
  const repeatedKarbalaNeighborhood = applyPromptPriceHints(
    {
      ...emptyFilters,
      city: "najaf",
      district: "najaf-center",
      neighborhood: "al-muhandisiyyin-najaf",
    },
    "أريد بيتًا في حي المهندسين في كربلاء",
  )
  assert.equal(repeatedKarbalaNeighborhood.city, "karbala")
  assert.equal(repeatedKarbalaNeighborhood.district, "karbala-center")
  assert.equal(repeatedKarbalaNeighborhood.neighborhood, null)
  assert.deepEqual(parseStoredAgarlyOutcome(emptyFilters), {
    filters: emptyFilters,
    clarification: null,
  })

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
  const houseFloorsWhere = buildAgarlyListingWhere({
    ...filters,
    category: "house",
    propertyFloors: 4,
  })
  assert.deepEqual(houseFloorsWhere.propertyFloors, { gte: 4 })
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
  const oldAiModel = process.env.AI_MODEL
  process.env.AI_PROVIDER = "kilo"
  process.env.KILO_API_KEY = "test-key"
  process.env.AI_MODEL = "kilo-test/model"
  assert.equal(getConfiguredAgarlyProvider().name, "kilo")
  assert.equal(getConfiguredAgarlyProvider().model, "kilo-test/model")
  delete process.env.KILO_API_KEY
  assert.throws(() => getConfiguredAgarlyProvider(), AgarlyProviderError)
  if (oldProvider === undefined) delete process.env.AI_PROVIDER
  else process.env.AI_PROVIDER = oldProvider
  if (oldKiloKey === undefined) delete process.env.KILO_API_KEY
  else process.env.KILO_API_KEY = oldKiloKey
  if (oldAiModel === undefined) delete process.env.AI_MODEL
  else process.env.AI_MODEL = oldAiModel

  const previousFetch = globalThis.fetch
  let kiloRequestBody: unknown
  globalThis.fetch = async (_input, init) => {
    kiloRequestBody = JSON.parse(String(init?.body))
    return Response.json({
      choices: [{
        message: {
          content: JSON.stringify({
            intent: "listings",
            category: "villa",
            deal: "sale",
            city: "أربيل",
            maxPriceIqd: 300_000_000,
            insideComplex: true,
          }),
        },
      }],
    })
  }
  const extracted = await createKiloProvider("test-key").extractFilters(
    "فيلا داخل مجمع في أربيل بأقل من 300 مليون دينار",
    new AbortController().signal,
  )
  assert.equal(extracted.category, "villa")
  assert.equal(extracted.city, "erbil")
  assert.equal(extracted.maxPriceIqd, 300_000_000)
  assert.equal(extracted.insideComplex, true)
  assert.equal(extracted.intent, "mixed")
  assert.equal(
    (kiloRequestBody as { response_format?: { type?: string } }).response_format?.type,
    "json_schema",
  )

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
  assert.match(ui, /AgarlyFilterEditor/)
  assert.match(ui, /\/api\/agarly\/results/)
  assert.match(ui, /توضيح سريع/)
  assert.match(ui, /selectClarificationOption/)

  console.log("Agarly AI extraction, privacy, visibility, quota, provider and UI contracts OK")
}

void run()

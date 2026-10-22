import { z } from "zod"

import { districtsOf, iraqCities, neighborhoodsOf } from "@/lib/locations"
import { toEnglishDigits } from "@/lib/numerals"

export const AGARLY_INTENTS = ["listings", "projects", "agencies", "mixed"] as const
export const AGARLY_CATEGORIES = [
  "apartment",
  "house",
  "villa",
  "office",
  "land",
  "building",
  "farm",
] as const
export const AGARLY_DEALS = ["sale", "rent", "daily"] as const
export const AGARLY_LAND_USES = [
  "residential",
  "agricultural",
  "commercial",
  "residential-commercial",
  "industrial",
] as const
export const AGARLY_SORTS = [
  "newest",
  "price-asc",
  "price-desc",
  "area-asc",
  "area-desc",
] as const

const shortText = z.string().trim().min(1).max(80)
const nullableShortText = shortText.nullable().optional()
const nullableInteger = (min: number, max: number) =>
  z.number().int().min(min).max(max).nullable().optional()

export const agarlyProviderFiltersSchema = z
  .object({
    intent: z.enum(AGARLY_INTENTS).optional(),
    category: z.enum(AGARLY_CATEGORIES).nullable().optional(),
    deal: z.enum(AGARLY_DEALS).nullable().optional(),
    landUse: z.enum(AGARLY_LAND_USES).nullable().optional(),
    city: nullableShortText,
    district: nullableShortText,
    neighborhood: nullableShortText,
    complex: nullableShortText,
    projectQuery: nullableShortText,
    agencyQuery: nullableShortText,
    minPriceIqd: nullableInteger(0, 2_000_000_000),
    maxPriceIqd: nullableInteger(0, 2_000_000_000),
    minAreaM2: nullableInteger(0, 1_000_000),
    maxAreaM2: nullableInteger(0, 1_000_000),
    rooms: nullableInteger(0, 20),
    propertyFloors: nullableInteger(1, 50),
    insideComplex: z.boolean().optional(),
    approvedAgencyOnly: z.boolean().optional(),
    services: z.array(shortText.max(40)).max(8).optional(),
    keywords: z.array(shortText.max(40)).max(5).optional(),
    sort: z.enum(AGARLY_SORTS).optional(),
  })
  .strict()

export type AgarlyFilters = {
  intent: (typeof AGARLY_INTENTS)[number]
  category: (typeof AGARLY_CATEGORIES)[number] | null
  deal: (typeof AGARLY_DEALS)[number] | null
  landUse: (typeof AGARLY_LAND_USES)[number] | null
  city: string | null
  district: string | null
  neighborhood: string | null
  complex: string | null
  projectQuery: string | null
  agencyQuery: string | null
  minPriceIqd: number | null
  maxPriceIqd: number | null
  minAreaM2: number | null
  maxAreaM2: number | null
  rooms: number | null
  propertyFloors: number | null
  insideComplex: boolean
  approvedAgencyOnly: boolean
  services: string[]
  keywords: string[]
  sort: (typeof AGARLY_SORTS)[number]
}

const nullableNumberSchema = z.number().int().nonnegative().nullable()

export const agarlyFiltersSchema: z.ZodType<AgarlyFilters> = z
  .object({
    intent: z.enum(AGARLY_INTENTS),
    category: z.enum(AGARLY_CATEGORIES).nullable(),
    deal: z.enum(AGARLY_DEALS).nullable(),
    landUse: z.enum(AGARLY_LAND_USES).nullable(),
    city: z.string().max(80).nullable(),
    district: z.string().max(80).nullable(),
    neighborhood: z.string().max(80).nullable(),
    complex: z.string().max(80).nullable(),
    projectQuery: z.string().max(80).nullable(),
    agencyQuery: z.string().max(80).nullable(),
    minPriceIqd: nullableNumberSchema,
    maxPriceIqd: nullableNumberSchema,
    minAreaM2: nullableNumberSchema,
    maxAreaM2: nullableNumberSchema,
    rooms: z.number().int().min(0).max(20).nullable(),
    propertyFloors: z.number().int().min(1).max(50).nullable(),
    insideComplex: z.boolean(),
    approvedAgencyOnly: z.boolean(),
    services: z.array(z.string().min(1).max(40)).max(8),
    keywords: z.array(z.string().min(1).max(40)).max(5),
    sort: z.enum(AGARLY_SORTS),
  })
  .strict()

function normalizeLookup(value: string): string {
  return toEnglishDigits(value)
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
}

function matchesLocation(value: string, option: { slug: string; label: string }): boolean {
  const needle = normalizeLookup(value)
  return needle === normalizeLookup(option.slug) || needle === normalizeLookup(option.label)
}

function resolveLocation(input: {
  city?: string | null
  district?: string | null
  neighborhood?: string | null
}) {
  let city = input.city
    ? iraqCities.find((item) => matchesLocation(input.city!, item)) ?? null
    : null

  if (!city && input.district) {
    city =
      iraqCities.find((candidate) =>
        districtsOf(candidate.slug).some((item) => matchesLocation(input.district!, item))
      ) ?? null
  }

  const district =
    city && input.district
      ? districtsOf(city.slug).find((item) => matchesLocation(input.district!, item)) ?? null
      : null
  const neighborhood =
    city && district && input.neighborhood
      ? neighborhoodsOf(city.slug, district.slug).find((item) =>
          matchesLocation(input.neighborhood!, item)
        ) ?? null
      : null

  return {
    city: city?.slug ?? null,
    district: district?.slug ?? null,
    neighborhood: neighborhood?.slug ?? null,
  }
}

function cleanList(values: string[] | undefined, max: number): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of values ?? []) {
    const value = raw.replace(/\s+/g, " ").trim().slice(0, 40)
    const key = normalizeLookup(value)
    if (!value || seen.has(key)) continue
    seen.add(key)
    result.push(value)
    if (result.length >= max) break
  }
  return result
}

export function normalizeAgarlyFilters(value: unknown): AgarlyFilters {
  const parsed = agarlyProviderFiltersSchema.parse(value)
  const location = resolveLocation(parsed)
  let minPriceIqd = parsed.minPriceIqd ?? null
  let maxPriceIqd = parsed.maxPriceIqd ?? null
  let minAreaM2 = parsed.minAreaM2 ?? null
  let maxAreaM2 = parsed.maxAreaM2 ?? null

  if (minPriceIqd != null && maxPriceIqd != null && minPriceIqd > maxPriceIqd) {
    ;[minPriceIqd, maxPriceIqd] = [maxPriceIqd, minPriceIqd]
  }
  if (minAreaM2 != null && maxAreaM2 != null && minAreaM2 > maxAreaM2) {
    ;[minAreaM2, maxAreaM2] = [maxAreaM2, minAreaM2]
  }

  const result: AgarlyFilters = {
    intent: parsed.intent ?? "mixed",
    category: parsed.category ?? null,
    deal: parsed.deal ?? null,
    landUse: parsed.category === "land" ? (parsed.landUse ?? null) : null,
    ...location,
    complex: parsed.complex?.trim() || null,
    projectQuery: parsed.projectQuery?.trim() || parsed.complex?.trim() || null,
    agencyQuery: parsed.agencyQuery?.trim() || null,
    minPriceIqd,
    maxPriceIqd,
    minAreaM2,
    maxAreaM2,
    rooms: parsed.rooms ?? null,
    propertyFloors: parsed.propertyFloors ?? null,
    insideComplex: parsed.insideComplex ?? Boolean(parsed.complex),
    approvedAgencyOnly: parsed.approvedAgencyOnly ?? false,
    services: cleanList(parsed.services, 8),
    keywords: cleanList(parsed.keywords, 5),
    sort: parsed.sort ?? "newest",
  }
  return agarlyFiltersSchema.parse(result)
}

export function parseStoredAgarlyFilters(value: unknown): AgarlyFilters {
  return agarlyFiltersSchema.parse(value)
}

export const AGARLY_PROVIDER_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "intent", "category", "deal", "landUse", "city", "district", "neighborhood",
    "complex", "projectQuery", "agencyQuery", "minPriceIqd", "maxPriceIqd",
    "minAreaM2", "maxAreaM2", "rooms", "propertyFloors", "insideComplex",
    "approvedAgencyOnly", "services", "keywords", "sort",
  ],
  properties: {
    intent: { type: "string", enum: AGARLY_INTENTS },
    category: { anyOf: [{ type: "string", enum: AGARLY_CATEGORIES }, { type: "null" }] },
    deal: { anyOf: [{ type: "string", enum: AGARLY_DEALS }, { type: "null" }] },
    landUse: { anyOf: [{ type: "string", enum: AGARLY_LAND_USES }, { type: "null" }] },
    city: { anyOf: [{ type: "string", minLength: 1, maxLength: 80 }, { type: "null" }] },
    district: { anyOf: [{ type: "string", minLength: 1, maxLength: 80 }, { type: "null" }] },
    neighborhood: { anyOf: [{ type: "string", minLength: 1, maxLength: 80 }, { type: "null" }] },
    complex: { anyOf: [{ type: "string", minLength: 1, maxLength: 80 }, { type: "null" }] },
    projectQuery: { anyOf: [{ type: "string", minLength: 1, maxLength: 80 }, { type: "null" }] },
    agencyQuery: { anyOf: [{ type: "string", minLength: 1, maxLength: 80 }, { type: "null" }] },
    minPriceIqd: { anyOf: [{ type: "integer", minimum: 0, maximum: 2000000000 }, { type: "null" }] },
    maxPriceIqd: { anyOf: [{ type: "integer", minimum: 0, maximum: 2000000000 }, { type: "null" }] },
    minAreaM2: { anyOf: [{ type: "integer", minimum: 0, maximum: 1000000 }, { type: "null" }] },
    maxAreaM2: { anyOf: [{ type: "integer", minimum: 0, maximum: 1000000 }, { type: "null" }] },
    rooms: { anyOf: [{ type: "integer", minimum: 0, maximum: 20 }, { type: "null" }] },
    propertyFloors: { anyOf: [{ type: "integer", minimum: 1, maximum: 50 }, { type: "null" }] },
    insideComplex: { type: "boolean" },
    approvedAgencyOnly: { type: "boolean" },
    services: { type: "array", maxItems: 8, items: { type: "string", minLength: 1, maxLength: 40 } },
    keywords: { type: "array", maxItems: 5, items: { type: "string", minLength: 1, maxLength: 40 } },
    sort: { type: "string", enum: AGARLY_SORTS },
  },
} as const

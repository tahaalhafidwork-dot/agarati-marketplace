import { createHash } from "node:crypto"

import { iraqCities } from "@/lib/locations"
import { toEnglishDigits } from "@/lib/numerals"
import type { AgarlyFilters } from "@/lib/agarly/schema"

const EMAIL_PATTERN = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g
const LONG_PHONE_PATTERN = /(?:\+?\d[\s()-]*){8,}/g

export function normalizeSearchPrompt(value: string): string {
  return toEnglishDigits(value).replace(/\s+/g, " ").trim()
}

export function sanitizePromptForProvider(value: string): string {
  return normalizeSearchPrompt(value)
    .replace(EMAIL_PATTERN, "[بريد محذوف]")
    .replace(LONG_PHONE_PATTERN, "[رقم محذوف]")
    .slice(0, 500)
}

export function hashSearchPrompt(value: string): string {
  return createHash("sha256").update(normalizeSearchPrompt(value)).digest("hex")
}

export function parseIraqiPriceExpression(value: string): number | null {
  const normalized = toEnglishDigits(value)
    .replace(/[٬,\s]/g, "")
    .replace(/٫/g, ".")
  const match = normalized.match(/(\d+(?:\.\d+)?)(مليار|مليون|ألف|الف)?/)
  if (!match) return null
  const amount = Number(match[1])
  if (!Number.isFinite(amount) || amount < 0) return null
  const multiplier =
    match[2] === "مليار"
      ? 1_000_000_000
      : match[2] === "مليون"
        ? 1_000_000
        : match[2] === "ألف" || match[2] === "الف"
          ? 1_000
          : 1
  const result = Math.round(amount * multiplier)
  return result <= 2_000_000_000 ? result : null
}

/** Deterministic price guard for common Iraqi phrasing if the model omits it. */
function normalizeHintText(value: string): string {
  return normalizeSearchPrompt(value)
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F\u0670]/g, "")
}

function categoryHint(value: string): AgarlyFilters["category"] {
  if (value.includes("فيلا") || value.includes("فلل") || value.includes("قصر")) return "villa"
  if (value.includes("شقه") || value.includes("شقق")) return "apartment"
  if (value.includes("منزل") || value.includes("بيت") || value.includes("بيوت")) return "house"
  if (value.includes("مزرعه") || value.includes("مزارع")) return "farm"
  if (value.includes("عماره") || value.includes("مبنى") || value.includes("مباني")) return "building"
  if (value.includes("ارض") || value.includes("اراض") || value.includes("قطعه ارض")) return "land"
  if (
    (value.includes("مكتب") || value.includes("مكاتب")) &&
    !value.includes("مكتب عقاري") &&
    !value.includes("مكاتب عقاريه")
  ) return "office"
  return null
}

function roomCountHint(value: string): number | null {
  const numeric = value.match(/(\d{1,2})\s*(?:غرفه|غرف)/)
  if (numeric) {
    const count = Number(numeric[1])
    if (Number.isInteger(count) && count >= 0 && count <= 20) return count
  }
  if (/(?:غرفتين|غرفتان)/.test(value)) return 2
  const words: Array<[RegExp, number]> = [
    [/(?:غرفه واحده|غرفه واحد)/, 1],
    [/(?:ثلاث|ثلاثه)\s*(?:غرف|غرفه)/, 3],
    [/(?:اربع|اربعه)\s*(?:غرف|غرفه)/, 4],
    [/(?:خمس|خمسه)\s*(?:غرف|غرفه)/, 5],
    [/(?:ست|سته)\s*(?:غرف|غرفه)/, 6],
    [/(?:سبع|سبعه)\s*(?:غرف|غرفه)/, 7],
    [/(?:ثمان|ثمانيه)\s*(?:غرف|غرفه)/, 8],
    [/(?:تسع|تسعه)\s*(?:غرف|غرفه)/, 9],
    [/(?:عشر|عشره)\s*(?:غرف|غرفه)/, 10],
  ]
  return words.find(([pattern]) => pattern.test(value))?.[1] ?? null
}

/** Deterministic guard for explicit Iraqi search phrases if a routed model misses them. */
export function applyPromptHints(
  filters: AgarlyFilters,
  prompt: string,
): AgarlyFilters {
  const normalized = normalizeHintText(prompt)
  const amount =
    "([0-9٠-٩۰-۹][0-9٠-٩۰-۹٬,٫. ]*\\s*(?:مليار|مليون|ألف|الف|دينار|د\\.?\\s*ع))"
  const max = normalized.match(
    new RegExp(`(?:أقل من|اقل من|حتى|بحد أقصى|لا يتجاوز)\\s*${amount}`),
  )
  const min = normalized.match(
    new RegExp(`(?:اكثر من|ابتداء من|من)\\s*${amount}`),
  )
  const explicitMax = max?.[1] ? parseIraqiPriceExpression(max[1]) : null
  const explicitMin = min?.[1] ? parseIraqiPriceExpression(min[1]) : null
  const explicitCity = iraqCities.find((city) => normalized.includes(normalizeHintText(city.label)))
  const explicitCategory = categoryHint(normalized)
  const explicitRooms = roomCountHint(normalized)
  const explicitDeal: AgarlyFilters["deal"] =
    normalized.includes("ايجار يومي") || normalized.includes("للايجار اليومي")
      ? "daily"
      : normalized.includes("للبيع") || normalized.includes("شراء")
        ? "sale"
        : normalized.includes("للايجار") || normalized.includes("ايجار")
          ? "rent"
          : null
  return {
    ...filters,
    category: explicitCategory ?? filters.category,
    deal: explicitDeal ?? filters.deal,
    city: explicitCity?.slug ?? filters.city,
    rooms: explicitRooms ?? filters.rooms,
    insideComplex:
      normalized.includes("داخل مجمع") || normalized.includes("ضمن مجمع")
        ? true
        : filters.insideComplex,
    maxPriceIqd: explicitMax ?? filters.maxPriceIqd,
    minPriceIqd: explicitMin ?? filters.minPriceIqd,
  }
}

export const applyPromptPriceHints = applyPromptHints

export function agarlySystemPrompt(): string {
  const cities = iraqCities.map((city) => `${city.label}=${city.slug}`).join("، ")
  return `أنت محلل طلبات بحث عقاري عراقي. حوّل الطلب فقط إلى JSON مطابق للمخطط المرسل.
لا تُجب بنص، ولا تقترح عقارات، ولا تخترع أسماء مشاريع أو وكالات.
الأسعار دائمًا بالدينار العراقي كعدد صحيح. حوّل: ألف=1000، مليون=1000000، مليار=1000000000.
الفئات: apartment شقة، house منزل مستقل، villa فيلا/قصر، office مكتب، land أرض، building عمارة/مبنى، farm مزرعة.
الصفقات: sale للبيع، rent للإيجار الشهري، daily إيجار يومي.
إذا ذكر المستخدم مشروعًا أو مجمعًا ضعه حرفيًا في projectQuery وcomplex. وإذا ذكر مكتبًا/وكالة ضعه في agencyQuery.
لا تستنتج حقلًا لم يطلبه المستخدم. القيم غير المذكورة null، والمصفوفات غير المذكورة فارغة.
مدن العراق المتاحة: ${cities}`
}

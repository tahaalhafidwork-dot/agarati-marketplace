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
export function applyPromptPriceHints(
  filters: AgarlyFilters,
  prompt: string,
): AgarlyFilters {
  const normalized = normalizeSearchPrompt(prompt)
  const amount =
    "([0-9٠-٩۰-۹][0-9٠-٩۰-۹٬,٫. ]*\\s*(?:مليار|مليون|ألف|الف|دينار|د\\.?\\s*ع))"
  const max = normalized.match(
    new RegExp(`(?:أقل من|اقل من|حتى|بحد أقصى|لا يتجاوز)\\s*${amount}`),
  )
  const min = normalized.match(
    new RegExp(`(?:أكثر من|اكثر من|ابتداءً من|ابتداء من|من)\\s*${amount}`),
  )
  return {
    ...filters,
    maxPriceIqd:
      filters.maxPriceIqd ?? (max?.[1] ? parseIraqiPriceExpression(max[1]) : null),
    minPriceIqd:
      filters.minPriceIqd ?? (min?.[1] ? parseIraqiPriceExpression(min[1]) : null),
  }
}

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

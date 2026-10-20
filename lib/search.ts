import { toEnglishDigits } from "@/lib/numerals"

export type SearchIntent =
  | { kind: "listingNumber"; code: string }
  | { kind: "title"; text: string }

function fromArabicDigits(value: string): string {
  return toEnglishDigits(value)
}

/** English listing ref e.g. 00003 or 7L94I — never Arabic-Indic digits. */
export function formatListingNumber(n: number | string): string {
  const digits = fromArabicDigits(String(n)).replace(/\D/g, "")
  if (!digits) return "00000"
  const truncated = digits.length > 5 ? digits.slice(-5) : digits
  return truncated.padStart(5, "0")
}

export function listingNumberFromId(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) >>> 0
  }
  return formatListingNumber(h % 100000)
}

export function parseSearchIntent(raw: string | undefined | null): SearchIntent | null {
  if (!raw?.trim()) return null
  const trimmed = fromArabicDigits(raw).trim()
  const withoutHash = trimmed.replace(/^#/, "").trim()
  const compact = withoutHash.replace(/\s+/g, "")

  // Explicit listing number via # prefix: #7L94I, #00003, #123
  if (trimmed.startsWith("#") && compact.length >= 3) {
    return { kind: "listingNumber", code: compact.toUpperCase() }
  }

  // Pure numeric: 00003, 3, 12345
  if (/^\d+$/.test(compact)) {
    return { kind: "listingNumber", code: compact }
  }

  // Short alphanumeric codes (5-8 chars) with at least one digit: 7L94I, ABC123, XY99Z
  // Treat as listing number to support alphanumeric codes in DB
  // Require at least one digit to avoid false positives on words like "house"
  if (/^(?=.*\d)[A-Z0-9]{5,8}$/i.test(compact)) {
    return { kind: "listingNumber", code: compact.toUpperCase() }
  }

  return { kind: "title", text: trimmed }
}

export function listingNumberMatches(
  listingNumber: string,
  queryCode: string
): boolean {
  const stored = fromArabicDigits(listingNumber).replace(/\s+/g, "").toUpperCase()
  const q = queryCode.replace(/\s+/g, "").toUpperCase()
  if (!stored || !q) return false

  // Exact match (case-insensitive, whitespace-insensitive)
  if (stored === q) return true

  // Numeric equivalence: 003 ≡ 00003 ≡ 3
  const storedDigits = stored.replace(/\D/g, "")
  const qDigits = q.replace(/\D/g, "")
  if (storedDigits && qDigits) {
    try {
      return BigInt(storedDigits) === BigInt(qDigits)
    } catch {
      return storedDigits === qDigits
    }
  }

  return false
}

export function titleMatches(title: string, queryText: string): boolean {
  const t = title.trim().toLowerCase()
  const q = queryText.trim().toLowerCase()
  if (!q) return true
  return t.includes(q)
}

export function matchesSmartSearch(
  item: { title: string; listingNumber: string },
  q: string | undefined
): boolean {
  const intent = parseSearchIntent(q)
  if (!intent) return true
  if (intent.kind === "listingNumber") {
    return listingNumberMatches(item.listingNumber, intent.code)
  }
  return titleMatches(item.title, intent.text)
}

export function searchEmptyMessage(q: string | undefined): string {
  const intent = parseSearchIntent(q)
  if (!intent) return "لا توجد إعلانات تطابق التصفية الحالية."
  if (intent.kind === "listingNumber") {
    return `لا يوجد رقم إعلان مطابق لـ «${intent.code}». تحقق من الرقم وحاول مرة أخرى.`
  }
  return `لا نتائج لعناوين تطابق «${intent.text}».`
}

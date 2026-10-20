/** Suggested amenities / nearby services for listing authors. */

export const SUGGESTED_LISTING_SERVICES = [
  "جيم",
  "مسبح",
  "بارك خارجي",
  "حديقة",
  "مدرسة قريبة",
  "حضانة",
  "مسجد قريب",
  "مول / تسوق",
  "موقف سيارات",
  "أمن / حراسة",
  "مصعد",
  "مولد كهرباء",
  "إنترنت",
  "ملعب أطفال",
  "مستشفى قريب",
  "جامعة قريبة",
] as const

export const MAX_LISTING_SERVICES = 20
export const MAX_SERVICE_LABEL_LENGTH = 40

export function normalizeServiceLabel(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_SERVICE_LABEL_LENGTH)
}

/** Parse form values (getAll("services") or comma-separated). */
export function parseServicesFromForm(formData: FormData): string[] {
  const fromMulti = formData
    .getAll("services")
    .map((v) => normalizeServiceLabel(String(v)))
    .filter(Boolean)

  const fromCsv = String(formData.get("servicesCsv") ?? "")
    .split(/[,،|]/)
    .map(normalizeServiceLabel)
    .filter(Boolean)

  const merged = [...fromMulti, ...fromCsv]
  const seen = new Set<string>()
  const out: string[] = []
  for (const s of merged) {
    const key = s.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(s)
    if (out.length >= MAX_LISTING_SERVICES) break
  }
  return out
}

/** Stable demo services for sample listings. */
export function demoServicesForSlug(slug: string): string[] {
  const pool = [...SUGGESTED_LISTING_SERVICES]
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0
  const count = 3 + (h % 4)
  const picked: string[] = []
  for (let i = 0; i < count; i++) {
    picked.push(pool[(h + i * 7) % pool.length])
  }
  return [...new Set(picked)]
}

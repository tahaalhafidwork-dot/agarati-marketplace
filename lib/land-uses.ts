export const LAND_USE_OPTIONS = [
  { value: "residential", slug: "residential", label: "أراضٍ سكنية" },
  { value: "agricultural", slug: "agricultural", label: "أراضٍ زراعية" },
  { value: "commercial", slug: "commercial", label: "أراضٍ تجارية" },
  {
    value: "residential-commercial",
    slug: "residential-commercial",
    label: "أراضٍ تجارية سكنية",
  },
  { value: "industrial", slug: "industrial", label: "أراضٍ صناعية" },
] as const

export type LandUse = (typeof LAND_USE_OPTIONS)[number]["value"]

export const LAND_USE_LABELS: Record<LandUse, string> = Object.fromEntries(
  LAND_USE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<LandUse, string>

export const LAND_USE_SEARCH_TERMS: Record<LandUse, readonly string[]> = {
  residential: ["سكن"],
  agricultural: ["زراع"],
  commercial: ["تجار"],
  "residential-commercial": ["تجار", "سكن", "مختلط"],
  industrial: ["صناع"],
}

export function isLandUse(value: string): value is LandUse {
  return LAND_USE_OPTIONS.some((option) => option.value === value)
}

const LAND_USE_META_PREFIX = "landUse:"

export function encodeLandUseMeta(value: LandUse): string {
  return `${LAND_USE_META_PREFIX}${value}`
}

export function parseLandUseMeta(meta: string | null | undefined): LandUse | undefined {
  if (!meta?.startsWith(LAND_USE_META_PREFIX)) return undefined
  const value = meta.slice(LAND_USE_META_PREFIX.length)
  return isLandUse(value) ? value : undefined
}

export function classifyLandUse(text: string): LandUse | undefined {
  const normalized = text.trim()
  if (!normalized) return undefined

  const residential = normalized.includes("سكن")
  const commercial = normalized.includes("تجار")

  if (
    normalized.includes("مختلط") ||
    (residential && commercial)
  ) {
    return "residential-commercial"
  }
  if (normalized.includes("صناع")) return "industrial"
  if (normalized.includes("زراع")) return "agricultural"
  if (commercial) return "commercial"
  if (residential) return "residential"
  return undefined
}

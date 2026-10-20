export const AIR_CONDITIONING_OPTIONS = [
  { value: "central-ducts", label: "نظام مركزي (دكتات)" },
  { value: "wall-split", label: "مكيف جداري (سبليت)" },
  { value: "ceiling-cassette", label: "مكيف سقفي (كاسيت)" },
  { value: "concealed-ceiling", label: "مكيف مخفي بالسقف (كونسيلد)" },
  { value: "vrf-vrv", label: "نظام VRF / VRV" },
  { value: "central-chiller", label: "نظام شيلر مركزي" },
  { value: "evaporative-cooler", label: "مبرد هواء" },
  { value: "mixed", label: "نظام مختلط" },
  { value: "none", label: "لا يوجد نظام تكييف" },
] as const

export type AirConditioningCode =
  (typeof AIR_CONDITIONING_OPTIONS)[number]["value"]

const labels = Object.fromEntries(
  AIR_CONDITIONING_OPTIONS.map((option) => [option.value, option.label])
) as Record<AirConditioningCode, string>

/**
 * Old values are kept as aliases so existing listings remain readable and
 * discoverable without a data migration.
 */
const legacyAliases: Record<AirConditioningCode, readonly string[]> = {
  "central-ducts": ["مركزي", "تكييف مركزي", "تكييف مركزي (دكتات)"],
  "wall-split": [
    "مكيف جداري",
    "مكيف جداري (سبليت)",
    "وحدات منفصلة",
    "مكيفات سبليت",
    "مكيفات",
    "تكييف",
  ],
  "ceiling-cassette": ["مكيف بالسقف", "مكيف سقفي", "مكيف سقفي (كاسيت)"],
  "concealed-ceiling": [
    "مكيف مخفي",
    "مكيف مخفي بالسقف",
    "مكيف مخفي بالسقف (كونسيلد)",
  ],
  "vrf-vrv": ["VRF", "VRV", "نظام VRF", "نظام VRV"],
  "central-chiller": ["شيلر", "شيلر مركزي"],
  "evaporative-cooler": ["مبرد", "مبردة", "مبرد هواء"],
  mixed: ["مختلط", "تكييف مختلط"],
  none: ["لا يوجد", "بدون تكييف"],
}

export function isAirConditioningCode(
  value: string | null | undefined
): value is AirConditioningCode {
  return AIR_CONDITIONING_OPTIONS.some((option) => option.value === value)
}

export function airConditioningCodeFromStored(
  value: string | null | undefined
): AirConditioningCode | undefined {
  const normalized = value?.trim()
  if (!normalized) return undefined
  if (isAirConditioningCode(normalized)) return normalized

  return AIR_CONDITIONING_OPTIONS.find(
    (option) =>
      option.label === normalized ||
      legacyAliases[option.value].includes(normalized)
  )?.value
}

export function airConditioningLabel(
  value: string | null | undefined
): string | undefined {
  const code = airConditioningCodeFromStored(value)
  return code ? labels[code] : undefined
}

export function airConditioningStoredAliases(
  code: AirConditioningCode
): string[] {
  return [code, labels[code], ...legacyAliases[code]]
}

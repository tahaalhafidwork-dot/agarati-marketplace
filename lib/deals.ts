import type { DealType, PropertyCategory } from "@/lib/sample-listings"
import {
  CATEGORIES_WITH_DAILY,
  categoryAllowsDaily,
  categoryMenuLabels,
  dealLabels,
} from "@/lib/sample-listings"

export type DealOption = {
  value: DealType
  label: string
  hint: string
}

/** Canonical deal chips — same labels as browse / cards / taxonomy. */
export const DEAL_OPTIONS: DealOption[] = [
  { value: "sale", label: dealLabels.sale, hint: "تمليك" },
  { value: "rent", label: dealLabels.rent, hint: "شهري أو سنوي" },
  { value: "daily", label: dealLabels.daily, hint: "ليلة أو أيام" },
]

export const DAILY_DEAL_HINT =
  "إيجار يومي متاح لـ: الشقق السكنية، المنازل المستقلة، الفلل والقصور، والمزارع السياحية."

export function isDealAllowedForCategory(
  category: PropertyCategory,
  deal: DealType
): boolean {
  if (deal !== "daily") return true
  return categoryAllowsDaily(category)
}

export function dealOptionsForCategory(
  category: PropertyCategory | ""
): DealOption[] {
  // Always surface all three on the add-listing first step;
  // compatibility is enforced when both category + deal are chosen.
  if (!category) return DEAL_OPTIONS
  return DEAL_OPTIONS.filter((opt) =>
    isDealAllowedForCategory(category, opt.value)
  )
}

export function dailyNotAllowedMessage(category: PropertyCategory): string {
  return `الإيجار اليومي غير متاح لـ«${categoryMenuLabels[category]}». اختر للبيع أو للإيجار، أو غيّر نوع العقار.`
}

export { CATEGORIES_WITH_DAILY, categoryAllowsDaily }

import type { MobileDealType, MobilePropertyCategory } from "./types"

export const dealLabels: Record<MobileDealType, string> = {
  sale: "للبيع",
  rent: "للإيجار",
  daily: "إيجار يومي",
}

export const categoryMenuLabels: Record<MobilePropertyCategory, string> = {
  apartment: "شقق سكنية",
  house: "منازل مستقلة",
  villa: "فلل وقصور",
  office: "مكاتب تجارية",
  land: "قطع أراضٍ",
  building: "عمارات ومبانٍ",
  farm: "مزارع سياحية",
}

export const HOME_CATEGORIES: {
  category: MobilePropertyCategory
  label: string
}[] = (
  Object.entries(categoryMenuLabels) as [MobilePropertyCategory, string][]
).map(([category, label]) => ({ category, label }))

import type { DealType, PropertyCategory } from "@/lib/sample-listings"

export type ListingWizardStepId =
  | "type"
  | "details"
  | "location"
  | "publish"

export const LISTING_WIZARD_STEPS: {
  id: ListingWizardStepId
  label: string
  hint: string
}[] = [
  { id: "type", label: "النوع", hint: "العقار والصفقة" },
  { id: "details", label: "التفاصيل", hint: "السعر والمواصفات" },
  { id: "location", label: "الموقع", hint: "العنوان والخريطة" },
  { id: "publish", label: "النشر", hint: "الوصف والتواصل" },
]

export type CategoryFieldFlags = {
  rooms: boolean
  areaM2: boolean
  floor: boolean
  heating: boolean
  furnished: boolean
  services: boolean
  /** Hint under details step */
  detailsHint: string
}

/** Which detail fields apply for each property category. */
export const CATEGORY_FIELD_FLAGS: Record<PropertyCategory, CategoryFieldFlags> =
  {
    apartment: {
      rooms: true,
      areaM2: true,
      floor: true,
      heating: true,
      furnished: true,
      services: true,
      detailsHint: "الغرف والطابق والمساحة مهمة للشقق.",
    },
    house: {
      rooms: true,
      areaM2: true,
      floor: true,
      heating: true,
      furnished: true,
      services: true,
      detailsHint: "أدخل مواصفات المنزل بوضوح للمشتري أو المستأجر.",
    },
    villa: {
      rooms: true,
      areaM2: true,
      floor: true,
      heating: true,
      furnished: true,
      services: true,
      detailsHint: "الفلل غالباً تبرز بالمساحة والخدمات.",
    },
    office: {
      rooms: true,
      areaM2: true,
      floor: true,
      heating: true,
      furnished: true,
      services: true,
      detailsHint: "يمكن ذكر عدد الغرف/المكاتب والطابق.",
    },
    land: {
      rooms: false,
      areaM2: true,
      floor: false,
      heating: false,
      furnished: false,
      services: false,
      detailsHint: "للأراضي يكفي السعر والمساحة — بدون غرف أو طوابق.",
    },
    building: {
      rooms: false,
      areaM2: true,
      floor: true,
      heating: false,
      furnished: false,
      services: true,
      detailsHint: "للعمارات: المساحة وعدد الطوابق أو الوصف في الطابق.",
    },
    farm: {
      rooms: false,
      areaM2: true,
      floor: false,
      heating: false,
      furnished: false,
      services: true,
      detailsHint: "المزارع تُعرّف بالمساحة والخدمات المحيطة.",
    },
  }

export {
  DEAL_OPTIONS,
  DAILY_DEAL_HINT,
  dealOptionsForCategory,
  isDealAllowedForCategory,
  dailyNotAllowedMessage,
  categoryAllowsDaily,
  CATEGORIES_WITH_DAILY,
} from "@/lib/deals"

export function categoryIconKey(category: PropertyCategory): string {
  return category
}

export type { DealType }

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
  /** Unit position inside a larger building. */
  floorNumber: boolean
  /** Levels occupied by the advertised property (2 = duplex). */
  propertyFloors: boolean
  /** Total floors in the host building. */
  buildingFloors: boolean
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
      floorNumber: true,
      propertyFloors: true,
      buildingFloors: true,
      heating: true,
      furnished: true,
      services: true,
      detailsHint:
        "حدّد عدد الغرف، طابق الوحدة، وعدد طوابقها بدقة (2 يعني دوبلكس).",
    },
    house: {
      rooms: true,
      areaM2: true,
      floorNumber: false,
      propertyFloors: true,
      buildingFloors: false,
      heating: true,
      furnished: true,
      services: true,
      detailsHint: "حدّد عدد الغرف وعدد طوابق المنزل نفسه.",
    },
    villa: {
      rooms: true,
      areaM2: true,
      floorNumber: false,
      propertyFloors: true,
      buildingFloors: false,
      heating: true,
      furnished: true,
      services: true,
      detailsHint: "حدّد عدد الغرف وطوابق الفيلا إضافة إلى المساحة والخدمات.",
    },
    office: {
      rooms: true,
      areaM2: true,
      floorNumber: true,
      propertyFloors: true,
      buildingFloors: true,
      heating: true,
      furnished: true,
      services: true,
      detailsHint:
        "حدّد عدد الغرف/المكاتب، طابق الوحدة، والطوابق التي يشغلها المكتب.",
    },
    land: {
      rooms: false,
      areaM2: true,
      floorNumber: false,
      propertyFloors: false,
      buildingFloors: false,
      heating: false,
      furnished: false,
      services: false,
      detailsHint: "للأراضي يكفي السعر والمساحة — بدون غرف أو طوابق.",
    },
    building: {
      rooms: false,
      areaM2: true,
      floorNumber: false,
      propertyFloors: true,
      buildingFloors: false,
      heating: false,
      furnished: false,
      services: true,
      detailsHint: "للعمارات: المساحة وعدد طوابق العقار بدقة.",
    },
    farm: {
      rooms: false,
      areaM2: true,
      floorNumber: false,
      propertyFloors: false,
      buildingFloors: false,
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

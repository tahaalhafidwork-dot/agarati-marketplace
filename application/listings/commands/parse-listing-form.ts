import { normalizeIraqPhone } from "@/lib/phone"
import { parseServicesFromForm } from "@/lib/listing-services"
import {
  CATEGORY_FIELD_FLAGS,
  categoryAllowsComplex,
} from "@/lib/listing-form-config"
import { isLandUse, type LandUse } from "@/lib/land-uses"
import {
  BUILDING_FLOOR_OPTIONS,
  FLOOR_NUMBER_OPTIONS,
  legacyFloorValue,
  legacyRoomsValue,
  parseFurnishedOption,
  parseIntegerOption,
  propertyFloorOptionsForCategory,
  roomCountOptionsForCategory,
} from "@/lib/listing-attributes"
import type { DealType, PropertyCategory } from "@/lib/sample-listings"
import { airConditioningCodeFromStored } from "@/lib/air-conditioning"

export type ContactMethod = "WHATSAPP_PHONE" | "ALL" | "CHAT"

export type ParsedListingForm = {
  title: string
  description: string
  category: PropertyCategory
  deal: DealType
  landUse: LandUse | null
  priceIqd: number
  rooms: string | null
  roomCount: number | null
  areaM2: number | null
  floor: string | null
  floorNumber: number | null
  propertyFloors: number | null
  buildingFloors: number | null
  heating: string | null
  furnished: string | null
  citySlug: string
  districtSlug: string
  neighborhoodSlug: string
  complexSlug: string | null
  proposedComplexName: string | null
  inComplex: boolean
  streetPrivate: string | null
  phone: string | null
  whatsapp: string | null
  contactMethod: ContactMethod
  publish: boolean
  mapLat: number | null
  mapLng: number | null
  services: ReturnType<typeof parseServicesFromForm>
}

export function parseListingForm(formData: FormData): ParsedListingForm {
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const category = String(formData.get("category") ?? "") as PropertyCategory
  const deal = String(formData.get("deal") ?? "") as DealType
  const landUseRaw = String(formData.get("landUse") ?? "").trim()
  const landUse =
    category === "land" && isLandUse(landUseRaw) ? landUseRaw : null
  const flags = CATEGORY_FIELD_FLAGS[category]
  const priceRaw = String(formData.get("price") ?? "").replace(/\D/g, "")
  const priceIqd = Number(priceRaw)
  const roomCount = flags?.rooms
    ? parseIntegerOption(
        formData.get("roomCount"),
        roomCountOptionsForCategory(category)
      )
    : null
  const rooms = legacyRoomsValue(roomCount)
  const areaM2Raw = String(formData.get("areaM2") ?? "").replace(/\D/g, "")
  const areaM2 = areaM2Raw ? Number(areaM2Raw) : null
  const floorNumber = flags?.floorNumber
    ? parseIntegerOption(formData.get("floorNumber"), FLOOR_NUMBER_OPTIONS)
    : null
  const propertyFloors = flags?.propertyFloors
    ? parseIntegerOption(
        formData.get("propertyFloors"),
        propertyFloorOptionsForCategory(category)
      )
    : null
  const buildingFloors = flags?.buildingFloors
    ? parseIntegerOption(
        formData.get("buildingFloors"),
        BUILDING_FLOOR_OPTIONS
      )
    : null
  const floor = legacyFloorValue({
    category,
    floorNumber,
    propertyFloors,
    buildingFloors,
  })
  const heating = flags?.heating
    ? airConditioningCodeFromStored(
        String(formData.get("heating") ?? "").trim()
      ) ?? null
    : null
  const furnished = flags?.furnished
    ? parseFurnishedOption(formData.get("furnished"))
    : null
  const citySlug = String(formData.get("city") ?? "").trim()
  const districtSlug = String(formData.get("district") ?? "").trim()
  const neighborhoodSlug = String(formData.get("neighborhood") ?? "").trim()
  const complexAllowed = categoryAllowsComplex(category)
  const inComplex =
    complexAllowed && String(formData.get("inComplex") ?? "") === "1"
  const complexSlug = inComplex
    ? String(formData.get("complex") ?? "").trim() || null
    : null
  const proposedComplexName = inComplex
    ? String(formData.get("proposedComplexName") ?? "").trim() || null
    : null
  const streetPrivate =
    String(formData.get("streetPrivate") ?? "").trim() || null
  const phoneRaw = String(formData.get("phone") ?? "").trim() || null
  const whatsappRaw = String(formData.get("whatsapp") ?? "").trim() || phoneRaw
  const phone = phoneRaw ? normalizeIraqPhone(phoneRaw) ?? phoneRaw : null
  const whatsapp = whatsappRaw
    ? normalizeIraqPhone(whatsappRaw) ?? whatsappRaw
    : null
  const contactMethod =
    (String(formData.get("contactMethod") ?? "CHAT") as ContactMethod) ||
    "CHAT"
  const publish = String(formData.get("publish") ?? "") === "1"
  const mapLatRaw = String(formData.get("mapLat") ?? "").trim()
  const mapLngRaw = String(formData.get("mapLng") ?? "").trim()
  const mapLat = mapLatRaw ? Number(mapLatRaw) : null
  const mapLng = mapLngRaw ? Number(mapLngRaw) : null
  const services = parseServicesFromForm(formData)

  return {
    title,
    description,
    category,
    deal,
    landUse,
    priceIqd,
    rooms,
    roomCount,
    areaM2,
    floor,
    floorNumber,
    propertyFloors,
    buildingFloors,
    heating,
    furnished,
    citySlug,
    districtSlug,
    neighborhoodSlug,
    complexSlug,
    proposedComplexName,
    inComplex,
    streetPrivate,
    phone,
    whatsapp,
    contactMethod,
    publish,
    mapLat,
    mapLng,
    services,
  }
}

export function validateListingFormCore(
  data: ParsedListingForm,
  mode: "create" | "update"
): string | null {
  if (
    !data.title ||
    !data.description ||
    !data.citySlug ||
    !data.districtSlug ||
    !data.neighborhoodSlug
  ) {
    return "أكمل العنوان والوصف والموقع."
  }
  if (!data.priceIqd || Number.isNaN(data.priceIqd)) {
    return "أدخل سعراً صحيحاً."
  }
  const flags = CATEGORY_FIELD_FLAGS[data.category]
  if (data.category === "land" && !data.landUse) {
    return "اختر صفة إعمار الأرض من القائمة."
  }
  if (flags?.rooms && data.roomCount == null) {
    return "اختر عدد الغرف من القائمة."
  }
  if (flags?.floorNumber && data.floorNumber == null) {
    return "اختر رقم طابق الوحدة من القائمة."
  }
  if (flags?.propertyFloors && data.propertyFloors == null) {
    return "اختر عدد طوابق العقار من القائمة."
  }
  if (flags?.buildingFloors && data.buildingFloors == null) {
    return "اختر إجمالي طوابق المبنى من القائمة."
  }
  if (flags?.heating && data.heating == null) {
    return "اختر نظام التكييف من القائمة."
  }
  if (flags?.furnished && data.furnished == null) {
    return "اختر حالة الأثاث من القائمة."
  }
  if (
    data.floorNumber != null &&
    data.floorNumber >= 0 &&
    data.buildingFloors != null &&
    data.floorNumber > data.buildingFloors
  ) {
    return "رقم طابق الوحدة لا يمكن أن يتجاوز إجمالي طوابق المبنى."
  }
  if (
    data.propertyFloors != null &&
    data.buildingFloors != null &&
    data.propertyFloors > data.buildingFloors
  ) {
    return "عدد طوابق العقار لا يمكن أن يتجاوز إجمالي طوابق المبنى."
  }
  if (
    data.mapLat == null ||
    data.mapLng == null ||
    !Number.isFinite(data.mapLat) ||
    !Number.isFinite(data.mapLng) ||
    data.mapLat < 29 ||
    data.mapLat > 38 ||
    data.mapLng < 38 ||
    data.mapLng > 49
  ) {
    return mode === "create"
      ? "حدّد موقعاً تقريبياً على الخريطة قبل النشر."
      : "حدّد موقعاً تقريبياً على الخريطة قبل الحفظ."
  }
  if (data.inComplex) {
    if (data.proposedComplexName) {
      if (data.proposedComplexName.trim().length < 2) {
        return "أدخل اسم المجمع المقترح."
      }
    } else if (!data.complexSlug) {
      return "اختر المجمع أو اقترح اسماً جديداً."
    }
  }
  return null
}

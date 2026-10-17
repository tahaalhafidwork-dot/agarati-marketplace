import type { PropertyCategory } from "@/lib/sample-listings"

export const ROOM_COUNT_OPTIONS = numberRange(0, 20)
export const FLOOR_NUMBER_OPTIONS = numberRange(-3, 60)
export const PROPERTY_FLOOR_OPTIONS = numberRange(1, 20)
export const BUILDING_FLOOR_OPTIONS = numberRange(1, 60)

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩"
const EASTERN_ARABIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹"

function numberRange(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index)
}

export function roomCountOptionsForCategory(
  category: PropertyCategory | ""
): readonly number[] {
  return category === "apartment" || category === "office"
    ? ROOM_COUNT_OPTIONS
    : ROOM_COUNT_OPTIONS.slice(1)
}

export function toArabicNumber(value: number): string {
  return String(value).replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)]!)
}

export function fromArabicDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) =>
      String(EASTERN_ARABIC_DIGITS.indexOf(digit))
    )
}

export function parseIntegerOption(
  value: FormDataEntryValue | string | null | undefined,
  options: readonly number[]
): number | null {
  const normalized = fromArabicDigits(String(value ?? "")).trim()
  if (!/^-?\d+$/.test(normalized)) return null
  const parsed = Number(normalized)
  return options.includes(parsed) ? parsed : null
}

export function parseLegacyRoomCount(value?: string | null): number | null {
  const match = fromArabicDigits(value ?? "").match(/\d+/)
  if (!match) return null
  const parsed = Number(match[0])
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null
}

function legacyNumbers(value?: string | null): number[] {
  return [...fromArabicDigits(value ?? "").matchAll(/-?\d+/g)]
    .map((match) => Number(match[0]))
    .filter(Number.isInteger)
}

export type NormalizedFloorValues = {
  floorNumber: number | null
  propertyFloors: number | null
  buildingFloors: number | null
}

export function inferLegacyFloorValues(
  category: PropertyCategory,
  value?: string | null
): NormalizedFloorValues {
  const normalized = (value ?? "").trim()
  const numbers = legacyNumbers(normalized)
  const unitInBuilding = category === "apartment" || category === "office"

  if (unitInBuilding) {
    return {
      floorNumber:
        normalized === "أرضي" ? 0 : numbers.length > 0 ? numbers[0]! : null,
      propertyFloors: /دوبلكس/.test(normalized)
        ? 2
        : /تربلكس|ثلاثي/.test(normalized)
          ? 3
          : 1,
      buildingFloors: numbers.length > 1 ? numbers[1]! : null,
    }
  }

  if (
    category === "house" ||
    category === "villa" ||
    category === "building"
  ) {
    const propertyFloors = /دوبلكس|طابقان/.test(normalized)
      ? 2
      : /تربلكس|ثلاثي/.test(normalized)
        ? 3
        : numbers[0] ?? (/أرضي|مستقل|طابق واحد/.test(normalized) ? 1 : null)
    return { floorNumber: null, propertyFloors, buildingFloors: null }
  }

  return { floorNumber: null, propertyFloors: null, buildingFloors: null }
}

export function formatFloorNumber(value: number): string {
  if (value === 0) return "٠ (أرضي)"
  if (value < 0) return `${toArabicNumber(value)} (قبو)`
  return toArabicNumber(value)
}

export function formatPropertyFloors(value: number): string {
  if (value === 1) return "طابق واحد"
  if (value === 2) return "طابقان (دوبلكس)"
  if (value === 3) return "٣ طوابق (تربلكس)"
  return `${toArabicNumber(value)} طوابق`
}

export function formatBuildingFloors(value: number): string {
  return value === 1 ? "طابق واحد" : `${toArabicNumber(value)} طوابق`
}

export function legacyRoomsValue(roomCount: number | null): string | null {
  return roomCount == null ? null : toArabicNumber(roomCount)
}

export function legacyFloorValue(input: {
  category: PropertyCategory
  floorNumber: number | null
  propertyFloors: number | null
  buildingFloors: number | null
}): string | null {
  if (input.category === "apartment" || input.category === "office") {
    if (input.floorNumber == null) return null
    const floor = toArabicNumber(input.floorNumber)
    return input.buildingFloors == null
      ? floor
      : `${floor} / ${toArabicNumber(input.buildingFloors)}`
  }
  return input.propertyFloors == null
    ? null
    : formatPropertyFloors(input.propertyFloors)
}

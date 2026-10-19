import type { PropertyCategory } from "@/lib/sample-listings"
import { toEnglishDigits } from "@/lib/numerals"

export const ROOM_COUNT_OPTIONS = numberRange(0, 20)
export const FLOOR_NUMBER_OPTIONS = numberRange(-3, 60)
export const PROPERTY_FLOOR_OPTIONS = numberRange(1, 20)
export const BUILDING_FLOOR_OPTIONS = numberRange(1, 60)
export const FURNISHED_OPTIONS = ["مؤثث", "غير مؤثث"] as const

export type FurnishedOption = (typeof FURNISHED_OPTIONS)[number]

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

export function propertyFloorOptionsForCategory(
  category?: PropertyCategory | "",
): readonly number[] {
  if (category === "apartment") return PROPERTY_FLOOR_OPTIONS.slice(0, 3)
  if (category === "house" || category === "villa") {
    return PROPERTY_FLOOR_OPTIONS.slice(0, 4)
  }
  if (category === "office") return PROPERTY_FLOOR_OPTIONS.slice(0, 5)
  if (category === "building") return PROPERTY_FLOOR_OPTIONS
  return []
}

export function isMoreThanThreePropertyFloors(
  category: PropertyCategory | undefined,
  value: number,
): boolean {
  return (category === "house" || category === "villa") && value === 4
}

export function matchesPropertyFloorFilter(
  category: PropertyCategory,
  actual: number | null,
  selected: number,
): boolean {
  if (actual == null) return false
  return isMoreThanThreePropertyFloors(category, selected)
    ? actual >= 4
    : actual === selected
}

export function toEnglishNumber(value: number): string {
  return String(value)
}

export function fromArabicDigits(value: string): string {
  return toEnglishDigits(value)
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

export function parseFurnishedOption(
  value: FormDataEntryValue | string | null | undefined
): FurnishedOption | null {
  const normalized = String(value ?? "").trim()
  return FURNISHED_OPTIONS.find((option) => option === normalized) ?? null
}

export function normalizeLegacyFurnished(
  value?: string | null
): FurnishedOption | "" {
  const normalized = (value ?? "").trim()
  if (!normalized || normalized === "—") return ""
  if (/غير\s*(?:مؤثث|مفروش)|فارغ/.test(normalized)) return "غير مؤثث"
  if (/مؤثث|مفروش/.test(normalized)) return "مؤثث"
  return ""
}

export function parseLegacyRoomCount(value?: string | null): number | null {
  const normalized = fromArabicDigits(value ?? "").trim()
  if (/استوديو|مفتوح/.test(normalized)) return 0
  if (/(?:مكتب|غرفة)\s+واحد(?:ة)?/.test(normalized)) return 1
  if (/مكتب(?:ان|ين)|غرفت(?:ان|ين)/.test(normalized)) return 2

  const match = normalized.match(/\d+/)
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
    const propertyFloors =
      (category === "house" || category === "villa") &&
      /أكثر من\s*3/.test(fromArabicDigits(normalized))
        ? 4
        : /دوبلكس|طابقان/.test(normalized)
          ? 2
          : /تربلكس|ثلاثي/.test(normalized)
            ? 3
            : numbers[0] ??
              (/أرضي|مستقل|طابق واحد/.test(normalized) ? 1 : null)
    return { floorNumber: null, propertyFloors, buildingFloors: null }
  }

  return { floorNumber: null, propertyFloors: null, buildingFloors: null }
}

export function formatFloorNumber(value: number): string {
  if (value === 0) return "أرضي"
  if (value < 0) return `${toEnglishNumber(value)} (قبو)`
  return toEnglishNumber(value)
}

export function formatPropertyFloors(
  value: number,
  category?: PropertyCategory | "",
): string {
  const usesResidentialLayoutName =
    category === "apartment" || category === "house" || category === "villa"

  if (
    (category === "house" || category === "villa") &&
    value >= 4
  ) {
    return "أكثر من 3 طوابق"
  }

  if (value === 1) {
    return usesResidentialLayoutName
      ? "1 · طابق واحد (فلات)"
      : "1 · طابق واحد"
  }
  if (value === 2) {
    return usesResidentialLayoutName ? "2 · طابقان (دوبلكس)" : "2 · طابقان"
  }
  if (value === 3) {
    return usesResidentialLayoutName
      ? "3 · ثلاثة طوابق (تربلكس)"
      : "3 · ثلاثة طوابق"
  }
  return `${toEnglishNumber(value)} طوابق`
}

export function formatBuildingFloors(value: number): string {
  return value === 1 ? "طابق واحد" : `${toEnglishNumber(value)} طوابق`
}

export function legacyRoomsValue(roomCount: number | null): string | null {
  return roomCount == null ? null : toEnglishNumber(roomCount)
}

export function legacyFloorValue(input: {
  category: PropertyCategory
  floorNumber: number | null
  propertyFloors: number | null
  buildingFloors: number | null
}): string | null {
  if (input.category === "apartment" || input.category === "office") {
    if (input.floorNumber == null) return null
    const floor = toEnglishNumber(input.floorNumber)
    return input.buildingFloors == null
      ? floor
      : `${floor} / ${toEnglishNumber(input.buildingFloors)}`
  }
  return input.propertyFloors == null
    ? null
    : formatPropertyFloors(input.propertyFloors, input.category)
}

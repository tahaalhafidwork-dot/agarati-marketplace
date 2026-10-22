import { iraqCities, type City, type District, type Neighborhood } from "@/lib/locations"
import { toEnglishDigits } from "@/lib/numerals"

export type AgarlyLocationPath = {
  city: City
  district: District
  neighborhood?: Neighborhood
}

export type AgarlyLocationAmbiguity = {
  kind: "district" | "neighborhood"
  label: string
  candidates: AgarlyLocationPath[]
}

export type AgarlyPromptLocation = {
  city: string | null
  district: string | null
  neighborhood: string | null
  ambiguity: AgarlyLocationAmbiguity | null
  matched: boolean
}

function normalizeLocationText(value: string): string {
  return toEnglishDigits(value)
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function sameLocationValue(value: string, option: { slug: string; label: string }): boolean {
  const needle = normalizeLocationText(value).replace(/\s/g, "")
  return (
    needle === normalizeLocationText(option.slug).replace(/\s/g, "") ||
    needle === normalizeLocationText(option.label).replace(/\s/g, "")
  )
}

function containsLocationLabel(prompt: string, label: string): boolean {
  const haystack = ` ${normalizeLocationText(prompt)} `
  const needle = normalizeLocationText(label)
  return needle.length >= 3 && (
    haystack.includes(` ${needle} `) ||
    haystack.includes(` ب${needle} `)
  )
}

function allDistrictPaths(): AgarlyLocationPath[] {
  return iraqCities.flatMap((city) =>
    city.districts.map((district) => ({ city, district })),
  )
}

function allNeighborhoodPaths(): AgarlyLocationPath[] {
  return iraqCities.flatMap((city) =>
    city.districts.flatMap((district) =>
      district.neighborhoods.map((neighborhood) => ({ city, district, neighborhood })),
    ),
  )
}

const DISTRICT_PATHS = allDistrictPaths()
const NEIGHBORHOOD_PATHS = allNeighborhoodPaths()

export function isKnownAgarlyLocationName(value: string): boolean {
  return (
    iraqCities.some((city) => sameLocationValue(value, city)) ||
    DISTRICT_PATHS.some((path) => sameLocationValue(value, path.district)) ||
    NEIGHBORHOOD_PATHS.some((path) => sameLocationValue(value, path.neighborhood!))
  )
}

function longestMentionedPaths<T extends AgarlyLocationPath>(
  prompt: string,
  paths: T[],
  labelOf: (path: T) => string,
): T[] {
  const matches = paths.filter((path) => containsLocationLabel(prompt, labelOf(path)))
  if (!matches.length) return []
  const longest = Math.max(...matches.map((path) => normalizeLocationText(labelOf(path)).length))
  return matches.filter((path) => normalizeLocationText(labelOf(path)).length === longest)
}

function uniquePath(paths: AgarlyLocationPath[]): AgarlyLocationPath | null {
  if (paths.length !== 1) return null
  return paths[0]
}

/** Resolve exact provider values while only inferring parents from an unambiguous path. */
export function resolveAgarlyLocationInput(input: {
  city?: string | null
  district?: string | null
  neighborhood?: string | null
}): Pick<AgarlyPromptLocation, "city" | "district" | "neighborhood"> {
  const city = input.city
    ? iraqCities.find((candidate) => sameLocationValue(input.city!, candidate)) ?? null
    : null

  let districtPaths = input.district
    ? DISTRICT_PATHS.filter((path) => sameLocationValue(input.district!, path.district))
    : []
  if (city) districtPaths = districtPaths.filter((path) => path.city.slug === city.slug)

  let neighborhoodPaths = input.neighborhood
    ? NEIGHBORHOOD_PATHS.filter((path) => sameLocationValue(input.neighborhood!, path.neighborhood!))
    : []
  if (city) neighborhoodPaths = neighborhoodPaths.filter((path) => path.city.slug === city.slug)
  const district = uniquePath(districtPaths)?.district ?? null
  if (district) {
    neighborhoodPaths = neighborhoodPaths.filter((path) => path.district.slug === district.slug)
  }

  const neighborhoodPath = uniquePath(neighborhoodPaths)
  const districtPath = uniquePath(districtPaths)
  return {
    city: (neighborhoodPath?.city ?? districtPath?.city ?? city)?.slug ?? null,
    district: (neighborhoodPath?.district ?? districtPath?.district)?.slug ?? null,
    neighborhood: neighborhoodPath?.neighborhood?.slug ?? null,
  }
}

/** Read known Iraqi place names directly from the user's wording, including district/city inference. */
export function analyzeAgarlyPromptLocation(prompt: string): AgarlyPromptLocation {
  const normalizedPrompt = normalizeLocationText(prompt)
  const paddedPrompt = ` ${normalizedPrompt} `
  const aliasCity = paddedPrompt.includes(" هولير ") || paddedPrompt.includes(" بهولير ")
    ? iraqCities.find((city) => city.slug === "erbil") ?? null
    : paddedPrompt.includes(" بغده ") || paddedPrompt.includes(" ببغده ")
      ? iraqCities.find((city) => city.slug === "baghdad") ?? null
      : null
  let districtPaths = longestMentionedPaths(prompt, DISTRICT_PATHS, (path) => path.district.label)
  let neighborhoodPaths = longestMentionedPaths(
    prompt,
    NEIGHBORHOOD_PATHS,
    (path) => path.neighborhood!.label,
  )
  const longerPlaceLabels = [
    ...districtPaths.map((path) => path.district.label),
    ...neighborhoodPaths.map((path) => path.neighborhood!.label),
  ]
  const cityMatches = iraqCities.filter(
    (city) =>
      containsLocationLabel(prompt, city.label) &&
      !longerPlaceLabels.some((label) => {
        const cityLabel = normalizeLocationText(city.label)
        const placeLabel = normalizeLocationText(label)
        return placeLabel !== cityLabel && placeLabel.includes(cityLabel)
      }),
  )
  const matched = Boolean(aliasCity || cityMatches.length || districtPaths.length || neighborhoodPaths.length)
  const explicitCity = cityMatches.length === 1 ? cityMatches[0] : aliasCity

  if (explicitCity) districtPaths = districtPaths.filter((path) => path.city.slug === explicitCity.slug)
  const districtPath = uniquePath(districtPaths)

  const parentCity = explicitCity ?? districtPath?.city ?? null
  if (parentCity) {
    neighborhoodPaths = neighborhoodPaths.filter((path) => path.city.slug === parentCity.slug)
  }
  if (districtPath) {
    neighborhoodPaths = neighborhoodPaths.filter(
      (path) => path.district.slug === districtPath.district.slug,
    )
  }

  const neighborhoodPath = uniquePath(neighborhoodPaths)
  if (neighborhoodPaths.length > 1) {
    const parentKeys = new Set(
      neighborhoodPaths.map((path) => `${path.city.slug}:${path.district.slug}`),
    )
    if (parentKeys.size === 1) {
      const parent = neighborhoodPaths[0]
      return {
        city: parent.city.slug,
        district: parent.district.slug,
        neighborhood: null,
        ambiguity: null,
        matched,
      }
    }
    return {
      city: parentCity?.slug ?? null,
      district: districtPath?.district.slug ?? null,
      neighborhood: null,
      ambiguity: {
        kind: "neighborhood",
        label: neighborhoodPaths[0].neighborhood!.label,
        candidates: neighborhoodPaths,
      },
      matched,
    }
  }
  if (!districtPath && districtPaths.length > 1) {
    return {
      city: explicitCity?.slug ?? null,
      district: null,
      neighborhood: null,
      ambiguity: {
        kind: "district",
        label: districtPaths[0].district.label,
        candidates: districtPaths,
      },
      matched,
    }
  }

  return {
    city: (neighborhoodPath?.city ?? districtPath?.city ?? explicitCity)?.slug ?? null,
    district: (neighborhoodPath?.district ?? districtPath?.district)?.slug ?? null,
    neighborhood: neighborhoodPath?.neighborhood?.slug ?? null,
    ambiguity: null,
    matched,
  }
}

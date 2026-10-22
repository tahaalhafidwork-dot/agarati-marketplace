import fs from "fs"

const path = "lib/sample-listings.ts"
let src = fs.readFileSync(path, "utf8")

const locs = {
  "erbil-apartment-ankawa": { city: "erbil", district: "erbil-center", neighborhood: "ankawa" },
  "baghdad-apartment-mansour": { city: "baghdad", district: "karkh", neighborhood: "mansour" },
  "baghdad-apartment-jadriya": { city: "baghdad", district: "rusafa", neighborhood: "jadriya" },
  "baghdad-apartment-saydiya": { city: "baghdad", district: "karkh", neighborhood: "saydiya" },
  "baghdad-rent-karrada": { city: "baghdad", district: "rusafa", neighborhood: "karrada" },
  "erbil-apartment-daratoo": {
    city: "erbil",
    district: "erbil-center",
    neighborhood: "daratoo",
    complex: "dream-city",
  },
  "baghdad-apartment-adhamiya": { city: "baghdad", district: "rusafa", neighborhood: "adhamiya" },
  "erbil-apartment-daily-italian": {
    city: "erbil",
    district: "erbil-center",
    neighborhood: "ankawa",
    complex: "italian-village",
  },
  "erbil-house-gulan": { city: "erbil", district: "erbil-center", neighborhood: "gulan" },
  "baghdad-house-kadhimiya": { city: "baghdad", district: "karkh", neighborhood: "kadhimiya" },
  "erbil-duplex-baharka": {
    city: "erbil",
    district: "baharka",
    neighborhood: "baharka-center",
  },
  "baghdad-house-rent-zayouna": {
    city: "baghdad",
    district: "madaen",
    neighborhood: "zayouna",
  },
  "erbil-villa-italian-village": {
    city: "erbil",
    district: "erbil-center",
    neighborhood: "ankawa",
    complex: "italian-village",
  },
  "erbil-villa-kesnazan": {
    city: "erbil",
    district: "kesnazan",
    neighborhood: "kesnazan-center",
    complex: "green-hills",
  },
  "baghdad-villa-alwiyah": { city: "baghdad", district: "rusafa", neighborhood: "alwiyah" },
  "baghdad-villa-zayouna": { city: "baghdad", district: "madaen", neighborhood: "zayouna" },
  "erbil-villa-rent-daily": {
    city: "erbil",
    district: "kesnazan",
    neighborhood: "kesnazan-center",
    complex: "green-hills",
  },
  "erbil-office-downtown": {
    city: "erbil",
    district: "erbil-center",
    neighborhood: "downtown",
  },
  "baghdad-office-mansour": { city: "baghdad", district: "karkh", neighborhood: "mansour" },
  "baghdad-office-sale-karrada": {
    city: "baghdad",
    district: "rusafa",
    neighborhood: "karrada",
    complex: "karrada-towers",
  },
  "erbil-shop-family-mall": {
    city: "erbil",
    district: "erbil-center",
    neighborhood: "downtown",
    complex: "family-mall",
  },
  "erbil-land-bastora": { city: "erbil", district: "bastora", neighborhood: "bastora-road" },
  "baghdad-land-dora": { city: "baghdad", district: "karkh", neighborhood: "dora" },
  "erbil-land-qashtapa": { city: "erbil", district: "qashtapa", neighborhood: "qashtapa-road" },
  "baghdad-land-abu-ghraib": {
    city: "baghdad",
    district: "abu-ghraib",
    neighborhood: "abu-ghraib-farms",
  },
  "erbil-land-rent-industrial": {
    city: "erbil",
    district: "kirkuk-road",
    neighborhood: "kirkuk-road-industrial",
  },
  "baghdad-building-mansour": { city: "baghdad", district: "karkh", neighborhood: "mansour" },
  "erbil-building-ankawa": { city: "erbil", district: "erbil-center", neighborhood: "ankawa" },
  "baghdad-building-rent-karrada": {
    city: "baghdad",
    district: "rusafa",
    neighborhood: "karrada",
  },
  "erbil-farm-shaqlawa": {
    city: "erbil",
    district: "shaqlawa",
    neighborhood: "shaqlawa-resort",
  },
  "baghdad-farm-taji": { city: "baghdad", district: "taji", neighborhood: "taji-farms" },
  "erbil-farm-rent-koya": { city: "erbil", district: "koya", neighborhood: "koya-farms" },
}

// Fix type
src = src.replace(
  /export type SampleListing = \{\r?\n  slug: string\r?\n  title: string\r?\n  area: string\r?\n/,
  `export type SampleListing = {\r\n  slug: string\r\n  title: string\r\n  location: LocationRef\r\n  /** Public line: مدينة · حي [/ مجمع] */\r\n  area: string\r\n`
)

let injected = 0
for (const [slug, loc] of Object.entries(locs)) {
  const re = new RegExp(`(slug: "${slug}",\\r?\\n)(?!\\s*location:)`)
  const parts = Object.entries(loc)
    .map(([k, v]) => `${k}: "${v}"`)
    .join(", ")
  if (re.test(src)) {
    src = src.replace(re, `$1    location: { ${parts} },\r\n`)
    injected++
  } else {
    console.warn("skip", slug)
  }
}

if (!src.includes("finalizeListings")) {
  src = src.replace(
    "export const sampleListings: SampleListing[] = [",
    "const _rawListings = ["
  )
  // already may be _rawListings
}

if (!src.includes("finalizeListings")) {
  src = src.replace(
    /(\] as Omit<SampleListing, "area">\[\])?\r?\n\r?\nexport function getListingBySlug/,
    `] as Array<Omit<SampleListing, "area"> & { area?: string }>

function finalizeListings(
  items: Array<Omit<SampleListing, "area"> & { area?: string }>
): SampleListing[] {
  return items.map((item) => {
    const { area: _ignored, ...rest } = item
    return {
      ...rest,
      area: formatShortArea(rest.location),
    }
  })
}

export const sampleListings: SampleListing[] = finalizeListings(_rawListings)

export function getListingBySlug`
  )
}

// If already _rawListings but no finalize
if (src.includes("const _rawListings = [") && !src.includes("finalizeListings")) {
  src = src.replace(
    /\r?\n\]\r?\n\r?\nexport function getListingBySlug/,
    `

] as Array<Omit<SampleListing, "area"> & { area?: string }>

function finalizeListings(
  items: Array<Omit<SampleListing, "area"> & { area?: string }>
): SampleListing[] {
  return items.map((item) => {
    const { area: _ignored, ...rest } = item
    return {
      ...rest,
      area: formatShortArea(rest.location),
    }
  })
}

export const sampleListings: SampleListing[] = finalizeListings(_rawListings)

export function getListingBySlug`
  )
}

fs.writeFileSync(path, src)
console.log("injected", injected)

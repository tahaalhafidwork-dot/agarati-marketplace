/**
 * Characterization contracts — freeze expected behavior before refactors.
 * Run: npm run characterize
 */
import { parseListingQuery } from "@/lib/listing-query"
import {
  activeFilterChips,
  buildPropertiesHref,
  parseListingQuery as parseQuery,
  queryListings,
} from "@/lib/listing-query"
import {
  buildListingWhere,
  countFromIndex,
  countPublicListings,
  fetchPublicListings,
  getPublicListingCountIndex,
} from "@/lib/listing-service"
import {
  draftFromQuery,
  draftToQueryPatch,
  emptyFilterDraft,
} from "@/components/search/listings-filter-fields"
import { dealOptionsForCategory } from "@/lib/deals"
import {
  inferLegacyFloorValues,
  normalizeLegacyFurnished,
  parseLegacyRoomCount,
} from "@/lib/listing-attributes"
import {
  parseListingForm,
  validateListingFormCore,
} from "@/application/listings/commands/parse-listing-form"
import { prisma } from "@/lib/db"
import { toEnglishDigits } from "@/lib/numerals"
import { sampleListings } from "@/lib/sample-listings"
import {
  guestActions,
  publicNav,
  dashboardNav,
  adminNav,
  authUserMenu,
  footerBrowse,
  footerLegal,
} from "@/lib/constants"

export type BrowseParseCase = {
  name: string
  params: Record<string, string | string[] | undefined>
  expect: {
    category?: string
    deal?: string
    sort: string
    city?: string
  }
}

/** URL → ListingQuery shape locks (browse page must keep these). */
export const browseParseCases: BrowseParseCase[] = [
  {
    name: "empty defaults newest",
    params: {},
    expect: { sort: "newest" },
  },
  {
    name: "apartment sale erbil",
    params: { type: "apartment", deal: "sale", city: "erbil" },
    expect: {
      category: "apartment",
      deal: "sale",
      city: "erbil",
      sort: "newest",
    },
  },
  {
    name: "rent price sort",
    params: { deal: "rent", sort: "price-asc" },
    expect: { deal: "rent", sort: "price-asc" },
  },
]

export type FavoriteOutcome = {
  name: string
  isDemo: boolean
  auth: boolean
  serverOk: boolean
  expectSource: "local" | "server" | "login-redirect"
}

/** Favorite decision matrix (SSOT rules). */
export const favoriteOutcomeCases: FavoriteOutcome[] = [
  {
    name: "demo always local",
    isDemo: true,
    auth: true,
    serverOk: true,
    expectSource: "local",
  },
  {
    name: "guest auth fail → login",
    isDemo: false,
    auth: false,
    serverOk: false,
    expectSource: "login-redirect",
  },
  {
    name: "authed success → server",
    isDemo: false,
    auth: true,
    serverOk: true,
    expectSource: "server",
  },
  {
    name: "authed missing listing → local fallback",
    isDemo: false,
    auth: true,
    serverOk: false,
    expectSource: "local",
  },
]

/** Unread count must stay a non-negative integer sum of listing + request threads. */
export const unreadCountContract = {
  min: 0,
  pollingFallbackMs: 12_000,
  threadPollingFallbackMs: 3_000,
} as const

/** Navigation label/href locks — surfaces must not drift. */
export const navHrefLocks = {
  publicNav: publicNav.map((i) => ({ href: i.href, label: i.label })),
  guestActions: guestActions.map((i) => ({ href: i.href, label: i.label })),
  authUserMenu: authUserMenu.map((i) => ({ href: i.href, label: i.label })),
  dashboardNav: dashboardNav.map((i) => ({ href: i.href, label: i.label })),
  adminNav: adminNav.map((i) => ({ href: i.href, label: i.label })),
  footerBrowse: footerBrowse.map((i) => ({ href: i.href, label: i.label })),
  footerLegal: footerLegal.map((i) => ({ href: i.href, label: i.label })),
  mobileBottom: [
    { href: "/agarly", label: "Agarly" },
    { href: "/projects", label: "مشاريع" },
    { href: "/dashboard/properties/new", label: "أضف إعلاناً" },
    { href: "/services", label: "خدمات" },
    { href: "/dashboard", label: "حسابي" },
  ],
  mobileDrawerCore: [
    { href: "/dashboard/property-requests", label: "طلبات العقارات" },
    { href: "/dashboard/settings", label: "الإعدادات" },
    { href: "/privacy", label: "سياسة الخصوصية" },
    { href: "/terms", label: "شروط الاستخدام" },
    { href: "/support", label: "الدعم" },
  ],
} as const

export function assertBrowseParseCases(): string[] {
  const errors: string[] = []
  for (const c of browseParseCases) {
    const q = parseListingQuery(c.params)
    if (c.expect.sort !== q.sort) {
      errors.push(`${c.name}: sort want ${c.expect.sort} got ${q.sort}`)
    }
    if (c.expect.category !== undefined && c.expect.category !== q.category) {
      errors.push(
        `${c.name}: category want ${c.expect.category} got ${q.category}`
      )
    }
    if (c.expect.deal !== undefined && c.expect.deal !== q.deal) {
      errors.push(`${c.name}: deal want ${c.expect.deal} got ${q.deal}`)
    }
    if (c.expect.city !== undefined && c.expect.city !== q.city) {
      errors.push(`${c.name}: city want ${c.expect.city} got ${q.city}`)
    }
  }
  return errors
}

export function assertNavLocks(): string[] {
  const errors: string[] = []
  const check = (
    name: string,
    actual: readonly { href: string; label: string }[],
    expected: readonly { href: string; label: string }[]
  ) => {
    if (actual.length !== expected.length) {
      errors.push(`${name}: length ${actual.length} !== ${expected.length}`)
      return
    }
    for (let i = 0; i < expected.length; i++) {
      if (actual[i]!.href !== expected[i]!.href) {
        errors.push(
          `${name}[${i}].href want ${expected[i]!.href} got ${actual[i]!.href}`
        )
      }
      if (actual[i]!.label !== expected[i]!.label) {
        errors.push(
          `${name}[${i}].label want ${expected[i]!.label} got ${actual[i]!.label}`
        )
      }
    }
  }
  check("publicNav", publicNav, navHrefLocks.publicNav)
  check("dashboardNav", dashboardNav, navHrefLocks.dashboardNav)
  check("adminNav", adminNav, navHrefLocks.adminNav)
  check("authUserMenu", authUserMenu, navHrefLocks.authUserMenu)
  return errors
}

export function assertListingFilterContracts(): string[] {
  const errors: string[] = []
  const legacyRoomCount = parseLegacyRoomCount("٣+١")
  const legacySingleOffice = parseLegacyRoomCount("مكتب واحد")
  const legacyDoubleOffice = parseLegacyRoomCount("مكتبين")
  const legacyOpenOffice = parseLegacyRoomCount("مفتوح")
  const legacyDuplex = inferLegacyFloorValues("apartment", "دوبلكس")
  if (
    legacyRoomCount !== 3 ||
    legacySingleOffice !== 1 ||
    legacyDoubleOffice !== 2 ||
    legacyOpenOffice !== 0 ||
    normalizeLegacyFurnished("مفروش جزئياً") !== "مؤثث" ||
    normalizeLegacyFurnished("فارغ") !== "غير مؤثث" ||
    legacyDuplex.propertyFloors !== 2
  ) {
    errors.push("legacy room and duplex values should normalize to numbers")
  }
  const unsupportedLandQuery = parseQuery({
    type: "land",
    rooms: "3",
    floor: "2",
    propertyFloors: "2",
  })
  if (
    unsupportedLandQuery.rooms != null ||
    unsupportedLandQuery.floor != null ||
    unsupportedLandQuery.propertyFloors != null
  ) {
    errors.push("URL parsing should discard unsupported land attributes")
  }
  if (parseQuery({ type: "apartment", rooms: "٠" }).rooms !== 0) {
    errors.push("apartment room filter should preserve studio value zero")
  }

  const listingForm = new FormData()
  for (const [key, value] of Object.entries({
    title: "شقة اختبار",
    description: "وصف كاف لاختبار الحقول الرقمية الجديدة.",
    category: "apartment",
    deal: "sale",
    price: "185000000",
    roomCount: "3",
    areaM2: "135",
    floorNumber: "6",
    propertyFloors: "2",
    buildingFloors: "12",
    furnished: "مؤثث",
    city: "erbil",
    district: "erbil-center",
    neighborhood: "ankawa",
    mapLat: "36.19",
    mapLng: "44.01",
  })) {
    listingForm.set(key, value)
  }
  const parsedListing = parseListingForm(listingForm)
  if (
    parsedListing.roomCount !== 3 ||
    parsedListing.rooms !== "3" ||
    parsedListing.floorNumber !== 6 ||
    parsedListing.propertyFloors !== 2 ||
    parsedListing.buildingFloors !== 12 ||
    parsedListing.furnished !== "مؤثث" ||
    parsedListing.floor !== "6 / 12" ||
    validateListingFormCore(parsedListing, "create") !== null
  ) {
    errors.push("listing form should persist normalized numeric room and floor data")
  }

  if (
    toEnglishDigits("١۲3") !== "123" ||
    sampleListings.some((item) =>
      [
        item.title,
        item.price,
        item.meta,
        item.rooms,
        item.areaM2,
        item.floor ?? "",
        item.date,
        item.description,
        ...(item.services ?? []),
      ].some((value) => /[٠-٩۰-۹]/.test(value))
    )
  ) {
    errors.push("user-facing listing values should use English digits")
  }

  listingForm.set("furnished", "مفروش جزئياً")
  const forgedFurnished = parseListingForm(listingForm)
  if (
    forgedFurnished.furnished != null ||
    !validateListingFormCore(forgedFurnished, "create")
  ) {
    errors.push("listing form should reject free-text furnished values")
  }
  listingForm.set("furnished", "مؤثث")

  listingForm.set("buildingFloors", "5")
  const impossibleFloor = parseListingForm(listingForm)
  if (!validateListingFormCore(impossibleFloor, "create")) {
    errors.push("listing form should reject a unit floor above the building total")
  }

  listingForm.set("category", "land")
  const forgedLand = parseListingForm(listingForm)
  if (
    forgedLand.roomCount != null ||
    forgedLand.floorNumber != null ||
    forgedLand.propertyFloors != null ||
    forgedLand.buildingFloors != null
  ) {
    errors.push("server parser should discard room and floor fields for land")
  }

  const baseParams = {
    type: "apartment",
    deal: "sale",
    city: "erbil",
    district: "erbil-center",
    neighborhood: "ankawa",
    minPrice: "185000000",
    maxPrice: "185000000",
    minArea: "135",
    maxArea: "135",
    rooms: "3",
    floor: "6",
    propertyFloors: "1",
    q: "عنكاوا",
  }
  const match = queryListings(parseQuery(baseParams))
  if (!match.some((listing) => listing.slug === "erbil-apartment-ankawa")) {
    errors.push("all selected filters should retain the matching Erbil apartment")
  }

  const where = buildListingWhere(parseQuery(baseParams))
  const whereFilters = where as unknown as {
    category: string
    deal: string
    citySlug: string
    districtSlug: string
    neighborhoodSlug: string
    priceIqd: { gte: number; lte: number }
    areaM2: { gte: number; lte: number }
    roomCount: number
    floorNumber: number
    propertyFloors: number
    title: { contains: string }
  }
  if (
    whereFilters.category !== "APARTMENT" ||
    whereFilters.deal !== "SALE" ||
    whereFilters.citySlug !== "erbil" ||
    whereFilters.districtSlug !== "erbil-center" ||
    whereFilters.neighborhoodSlug !== "ankawa" ||
    whereFilters.priceIqd.gte !== 185000000 ||
    whereFilters.priceIqd.lte !== 185000000 ||
    whereFilters.areaM2.gte !== 135 ||
    whereFilters.areaM2.lte !== 135 ||
    whereFilters.roomCount !== 3 ||
    whereFilters.floorNumber !== 6 ||
    whereFilters.propertyFloors !== 1 ||
    whereFilters.title.contains !== "عنكاوا"
  ) {
    errors.push("database where clause should include every selected filter")
  }

  const mismatches: Array<[string, Record<string, string>]> = [
    ["category", { type: "land" }],
    ["deal", { type: "apartment", deal: "rent" }],
    ["city", { type: "apartment", city: "baghdad" }],
    ["district", { type: "apartment", city: "erbil", district: "karkh" }],
    [
      "neighborhood",
      { type: "apartment", city: "erbil", district: "erbil-center", neighborhood: "mansour" },
    ],
    ["minimum price", { type: "apartment", minPrice: "185000001" }],
    ["maximum price", { type: "apartment", maxPrice: "184999999" }],
    ["minimum area", { type: "apartment", minArea: "136" }],
    ["maximum area", { type: "apartment", maxArea: "134" }],
    ["rooms", { type: "apartment", rooms: "4" }],
    ["floor", { type: "apartment", floor: "5" }],
    ["property floors", { type: "apartment", propertyFloors: "2" }],
    ["text search", { type: "apartment", q: "عنوان غير موجود" }],
  ]
  for (const [name, params] of mismatches) {
    const results = queryListings(parseQuery(params))
    if (results.some((listing) => listing.slug === "erbil-apartment-ankawa")) {
      errors.push(`${name} filter should exclude the Erbil apartment`)
    }
  }

  const roundTripHref = buildPropertiesHref({
    ...parseQuery(baseParams),
    sort: "price-asc",
    view: "map",
  })
  const roundTripParams = Object.fromEntries(
    new URL(roundTripHref, "https://agarati.test").searchParams.entries()
  )
  const roundTrip = parseQuery(roundTripParams)
  if (
    roundTrip.category !== "apartment" ||
    roundTrip.deal !== "sale" ||
    roundTrip.city !== "erbil" ||
    roundTrip.district !== "erbil-center" ||
    roundTrip.neighborhood !== "ankawa" ||
    roundTrip.minPrice !== 185000000 ||
    roundTrip.maxArea !== 135 ||
    roundTrip.rooms !== 3 ||
    roundTrip.floor !== 6 ||
    roundTrip.propertyFloors !== 1 ||
    roundTrip.q !== "عنكاوا" ||
    roundTrip.sort !== "price-asc"
  ) {
    errors.push("building and parsing a filter URL should preserve its query state")
  }

  const searchedParams = Object.fromEntries(
    new URL(
      buildPropertiesHref({ ...parseQuery(baseParams), q: "عنكاوا" }),
      "https://agarati.test"
    ).searchParams.entries()
  )
  const searched = parseQuery(searchedParams)
  if (
    searched.category !== "apartment" ||
    searched.deal !== "sale" ||
    searched.city !== "erbil" ||
    searched.minPrice !== 185000000 ||
    searched.rooms !== 3 ||
    searched.floor !== 6 ||
    searched.propertyFloors !== 1 ||
    searched.q !== "عنكاوا"
  ) {
    errors.push("submitting search should preserve existing property filters")
  }

  const priceChip = activeFilterChips(parseQuery(baseParams)).find(
    (chip) => chip.key === "price"
  )
  const clearedPrice = priceChip
    ? parseQuery(
        Object.fromEntries(
          new URL(priceChip.clearHref, "https://agarati.test").searchParams.entries()
        )
      )
    : undefined
  if (
    !clearedPrice ||
    clearedPrice.minPrice !== undefined ||
    clearedPrice.maxPrice !== undefined ||
    clearedPrice.category !== "apartment" ||
    clearedPrice.q !== "عنكاوا"
  ) {
    errors.push("clearing the price chip should remove only price bounds")
  }

  const landDraft = draftFromQuery({
    category: "land",
    deal: "daily",
    rooms: 3,
    floor: 2,
    propertyFloors: 2,
  })
  if (
    landDraft.deal ||
    landDraft.rooms ||
    landDraft.floor ||
    landDraft.propertyFloors
  ) {
    errors.push("land filters should omit unsupported room and floor filters")
  }
  if (dealOptionsForCategory("land").some((option) => option.value === "daily")) {
    errors.push("land deal options should not include daily rent")
  }
  if (!dealOptionsForCategory("apartment").some((option) => option.value === "daily")) {
    errors.push("apartment deal options should include daily rent")
  }

  const arabicBounds = draftToQueryPatch({
    ...emptyFilterDraft(),
    minPrice: "١٨٥٠٠٠٠٠٠",
    maxArea: "١٣٥",
  })
  if (arabicBounds.minPrice !== 185000000 || arabicBounds.maxArea !== 135) {
    errors.push("Arabic-Indic price and area inputs should become numeric filters")
  }

  return errors
}

export async function assertDatabaseReadFailuresDoNotShowSamples(): Promise<string[]> {
  const errors: string[] = []
  const keys = ["DATABASE_URL", "DATABASE_LIVE", "VERCEL", "NEXT_PHASE"] as const
  const previous = new Map(keys.map((key) => [key, process.env[key]]))

  try {
    process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/test"
    process.env.DATABASE_LIVE = "1"
    process.env.VERCEL = "1"
    process.env.NEXT_PHASE = "phase-production-build"

    const query = parseQuery({ type: "apartment" })
    const listings = await fetchPublicListings(query)
    if (listings.length > 0) {
      errors.push("database read failures must not be replaced with sample listings")
    }
    const count = await countPublicListings(query)
    if (count !== 0) errors.push("database count failures must not use sample counts")
    const index = await getPublicListingCountIndex()
    if (
      index.all !== 0 ||
      countFromIndex(index, { category: "apartment" }) !== 0
    ) {
      errors.push("category counts should be zero when database reads fail")
    }
  } catch (error) {
    errors.push(`database read failure contract threw: ${String(error)}`)
  } finally {
    for (const key of keys) {
      const value = previous.get(key)
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    await prisma.$disconnect()
  }

  return errors
}

export async function runAllCharacterization(): Promise<string[]> {
  return [
    ...assertBrowseParseCases(),
    ...assertNavLocks(),
    ...assertListingFilterContracts(),
    ...(await assertDatabaseReadFailuresDoNotShowSamples()),
  ]
}

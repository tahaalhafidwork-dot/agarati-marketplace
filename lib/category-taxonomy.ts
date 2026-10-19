import { categoryAllowsDaily } from "@/lib/deals"
import { LAND_USE_OPTIONS } from "@/lib/land-uses"
import {
  countFromIndex,
  getPublicListingCountIndex,
} from "@/lib/listing-service"
import {
  categoryMenuLabels,
  categoryPluralDefinite,
  categorySlugs,
  toEnglishDigits,
  type PropertyCategory,
} from "@/lib/sample-listings"

export type CategoryNode = {
  slug: string
  label: string
  count?: string
  href?: string
  children?: CategoryNode[]
}

const TYPE_ORDER: PropertyCategory[] = [
  "apartment",
  "house",
  "villa",
  "office",
  "land",
  "building",
  "farm",
]

/** بيع · إيجار · إيجار يومي (للسكن والمزارع فقط). */
function dealOptions(
  category: PropertyCategory,
  typeLabel: string,
  index: Record<string, number>
): CategoryNode[] {
  const all = countFromIndex(index, { category })
  const sale = countFromIndex(index, { category, deal: "sale" })
  const rent = countFromIndex(index, { category, deal: "rent" })
  const daily = countFromIndex(index, { category, deal: "daily" })
  const withDaily = categoryAllowsDaily(category)
  const landUseChildren = (deal: "sale" | "rent"): CategoryNode[] =>
    LAND_USE_OPTIONS.map((option) => ({
      slug: option.slug,
      label: option.label,
      href: `/properties?deal=${deal}&type=land&landUse=${option.value}`,
    }))

  const nodes: CategoryNode[] = [
    {
      slug: "all",
      label: `كل ${typeLabel}`,
      count: toEnglishDigits(all),
      href: `/properties?type=${category}`,
    },
    {
      slug: "sale",
      label: "للبيع",
      count: toEnglishDigits(sale),
      href: category === "land" ? undefined : `/properties?deal=sale&type=${category}`,
      children: category === "land" ? landUseChildren("sale") : undefined,
    },
    {
      slug: "rent",
      label: "للإيجار",
      count: toEnglishDigits(rent),
      href: category === "land" ? undefined : `/properties?deal=rent&type=${category}`,
      children: category === "land" ? landUseChildren("rent") : undefined,
    },
  ]

  if (withDaily) {
    nodes.push({
      slug: "daily",
      label: "إيجار يومي",
      count: toEnglishDigits(daily),
      href: `/properties?deal=daily&type=${category}`,
    })
  }

  return nodes
}

/**
 * Main menu = property types.
 * Second level = للبيع | للإيجار | إيجار يومي (حيث ينطبق).
 * Counts match /properties browse (DB if present, else samples).
 */
export async function getEmlakRoot(): Promise<CategoryNode> {
  const index = await getPublicListingCountIndex()
  return {
    slug: "emlak",
    label: "العقارات",
    count: toEnglishDigits(countFromIndex(index)),
    children: TYPE_ORDER.map((category) => ({
      slug: categorySlugs[category],
      label: categoryMenuLabels[category],
      count: toEnglishDigits(countFromIndex(index, { category })),
      children: dealOptions(
        category,
        categoryPluralDefinite[category],
        index
      ),
    })),
  }
}

export const relatedCategories = [
  { label: "المكاتب العقارية", href: "/agencies" },
  { label: "تواصل معنا", href: "/contact" },
] as const

export async function resolveCategoryPath(segments: string[]): Promise<{
  node: CategoryNode
  trail: { label: string; href: string }[]
  parentHref: string
} | null> {
  const emlakRoot = await getEmlakRoot()

  if (segments.length === 0) {
    return {
      node: emlakRoot,
      trail: [{ label: emlakRoot.label, href: "/categories" }],
      parentHref: "/",
    }
  }

  let current: CategoryNode = emlakRoot
  const trail: { label: string; href: string }[] = [
    { label: emlakRoot.label, href: "/categories" },
  ]
  let pathAcc = "/categories"

  for (const seg of segments) {
    const next = current.children?.find((c) => c.slug === seg)
    if (!next) return null
    pathAcc = `${pathAcc}/${seg}`
    trail.push({ label: next.label, href: pathAcc })
    current = next
  }

  const parentHref = trail.length > 1 ? trail[trail.length - 2].href : "/"

  return { node: current, trail, parentHref }
}

/** Map URL category folder slug → PropertyCategory key */
export function slugToCategory(slug: string): PropertyCategory | undefined {
  const entry = (
    Object.entries(categorySlugs) as [PropertyCategory, string][]
  ).find(([, s]) => s === slug)
  return entry?.[0]
}

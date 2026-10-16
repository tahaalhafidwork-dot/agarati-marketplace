/**
 * Verified Wikimedia cover photos for named **residential / mixed-use** developments.
 */

import type { ProjectKind } from "@prisma/client"

export const PROJECT_DEV_IMAGES_MAX = 3

const STOCK_RE =
  /images\.pexels\.com|images\.unsplash\.com|picsum\.photos|fastly\.picsum/i

export function isStockProjectImageUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return true
  return STOCK_RE.test(url)
}

export type RealProjectImage = {
  url: string
  subject: string
  credit: string
}

export type RealProjectCatalogEntry = {
  slug: string
  name: string
  projectKind: ProjectKind
  citySlug: string
  districtSlug?: string | null
  neighborhoodSlug?: string | null
  summary: string
  websiteUrl?: string | null
  images: RealProjectImage[]
}

/** Verified project blurbs (Arabic) — no image-credit fluff. */
export const PROJECT_SUMMARIES: Record<string, string> = {
  "empire-world":
    "مجمّع سكني–تجاري واسع في أربيل على مساحة تقارب ٧٥٠ ألف م². يضم فللًا وشققًا فاخرة، أبراج أعمال، مرافق خدمية وترفيهية، وفندقًا، ضمن بيئة مخطّطة أشبه بمدينة داخل المدينة.",
  "amwaj-towers":
    "أبراج سكنية شاهقة في بغداد من تطوير أمواج الدولية. وحدات سكنية عصرية ضمن مشروع أبراج مزدوجة، بخدمات مشتركة وموقع حضري يخدم السكن والاستثمار.",
  "flora-city":
    "مشروع سكني كبير على طريق كوية في أربيل، يضم شققًا وفللًا ضمن عدة مناطق. يتوفر كهرباء على مدار الساعة، غاز مركزي، حدائق، أمن، مواقف، مدرسة ومسجد وخدمات يومية داخل المجمّع.",
  "bakhtyari-complex":
    "أبراج سكنية في حي بختياري بأربيل. شقق متنوعة من الاستوديو إلى وحدات بغرفتين أو ثلاث، بتصميم حديث وموقع حيوي قريب من الخدمات والمحاور الرئيسية.",
}

/** Residential / mixed-use only — no shopping malls. */
export const REAL_PROJECTS: RealProjectCatalogEntry[] = [
  {
    slug: "empire-world",
    name: "إمباير وورلد",
    projectKind: "MIXED_USE",
    citySlug: "erbil",
    summary: PROJECT_SUMMARIES["empire-world"],
    websiteUrl: "https://empireworld.com",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/d/da/Empire_World_Erbil.jpg",
        subject: "إمباير وورلد — أربيل",
        credit: "CC0 · Wikimedia Commons",
      },
    ],
  },
  {
    slug: "amwaj-towers",
    name: "أبراج أمواج",
    projectKind: "RESIDENTIAL",
    citySlug: "baghdad",
    summary: PROJECT_SUMMARIES["amwaj-towers"],
    websiteUrl: "https://www.amwaj.com",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Amwaj_Towers_Baghdad-2025.png",
        subject: "أبراج أمواج",
        credit: "CC BY · Wikimedia Commons",
      },
    ],
  },
]

const catalogBySlug = new Map(REAL_PROJECTS.map((p) => [p.slug, p]))

export function verifiedUrlsForSlug(slug: string): string[] {
  return catalogBySlug.get(slug)?.images.map((i) => i.url) ?? []
}

export function projectHeroCover(
  project: { imageUrl?: string | null; imageUrls?: string[] | null },
  slug: string
): string | null {
  const allowed = new Set(verifiedUrlsForSlug(slug))
  if (allowed.size === 0) return null

  const candidates = [
    project.imageUrl,
    ...(project.imageUrls ?? []),
  ].filter((u): u is string => Boolean(u?.trim()))

  for (const url of candidates) {
    if (isStockProjectImageUrl(url)) continue
    if (allowed.has(url)) return url
  }
  return catalogBySlug.get(slug)?.images[0]?.url ?? null
}

export function projectHeroCredit(slug: string): string | null {
  const entry = catalogBySlug.get(slug)
  return entry?.images[0]?.credit ?? null
}

/** @deprecated use projectHeroCover */
export function projectDevImages(
  project: { imageUrl?: string | null; imageUrls?: string[] | null },
  fallbackSlug?: string
): string[] {
  const cover = fallbackSlug
    ? projectHeroCover(project, fallbackSlug)
    : null
  return cover ? [cover] : []
}

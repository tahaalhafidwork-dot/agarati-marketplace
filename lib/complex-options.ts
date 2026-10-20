/**
 * Complex / project name matching for listing forms and admin review.
 */
import type { ProjectKind, ProjectStatus } from "@prisma/client"

import { slugifyProjectName } from "@/lib/agency-directory"
import { isDatabaseConfigured, isDatabaseReachable, prisma } from "@/lib/db"
import { complexesOf, getComplex } from "@/lib/locations"
import { RESIDENTIAL_PROJECT_KINDS } from "@/lib/project-kinds"
import { toEnglishDigits } from "@/lib/numerals"

export type ComplexOption = {
  slug: string
  label: string
  citySlug: string
  districtSlug: string | null
  neighborhoodSlug: string | null
  source: "project" | "static"
}

/** Normalize Arabic / Latin names for duplicate detection. */
export function normalizeProjectName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F\u0670]/g, "") // diacritics
    .replace(/[^\p{L}\p{N}]+/gu, "")
}

export function namesLikelySame(a: string, b: string): boolean {
  const na = normalizeProjectName(a)
  const nb = normalizeProjectName(b)
  if (!na || !nb) return false
  if (na === nb) return true
  if (na.length >= 4 && nb.length >= 4) {
    if (na.includes(nb) || nb.includes(na)) return true
  }
  return false
}

export async function listApprovedProjectsForComplexes(take = 500) {
  if (!isDatabaseConfigured() || !(await isDatabaseReachable())) return []
  try {
    return await prisma.project.findMany({
      where: {
        status: "APPROVED",
        projectKind: { in: RESIDENTIAL_PROJECT_KINDS },
      },
      orderBy: { name: "asc" },
      take,
      select: {
        id: true,
        slug: true,
        name: true,
        citySlug: true,
        districtSlug: true,
        neighborhoodSlug: true,
        status: true,
        projectKind: true,
      },
    })
  } catch {
    return []
  }
}

/** Merge APPROVED DB projects with static location complexes (no slug clash). */
export function mergeComplexOptions(
  projects: Array<{
    slug: string
    name: string
    citySlug: string | null
    districtSlug: string | null
    neighborhoodSlug: string | null
  }>,
  city?: string,
  district?: string,
  neighborhood?: string
): ComplexOption[] {
  const out: ComplexOption[] = []
  const seen = new Set<string>()

  for (const p of projects) {
    if (!p.citySlug) continue
    if (city && p.citySlug !== city) continue
    if (district && p.districtSlug && p.districtSlug !== district) continue
    if (
      neighborhood &&
      p.neighborhoodSlug &&
      p.neighborhoodSlug !== neighborhood
    ) {
      continue
    }
    if (seen.has(p.slug)) continue
    seen.add(p.slug)
    out.push({
      slug: p.slug,
      label: toEnglishDigits(p.name),
      citySlug: p.citySlug,
      districtSlug: p.districtSlug,
      neighborhoodSlug: p.neighborhoodSlug,
      source: "project",
    })
  }

  if (city && district && neighborhood) {
    for (const c of complexesOf(city, district, neighborhood)) {
      if (seen.has(c.slug)) continue
      seen.add(c.slug)
      out.push({
        slug: c.slug,
        label: toEnglishDigits(c.label),
        citySlug: city,
        districtSlug: district,
        neighborhoodSlug: neighborhood,
        source: "static",
      })
    }
  }

  return out.sort((a, b) => a.label.localeCompare(b.label, "ar"))
}

export async function listComplexOptions(
  city?: string,
  district?: string,
  neighborhood?: string
): Promise<ComplexOption[]> {
  const projects = await listApprovedProjectsForComplexes()
  return mergeComplexOptions(projects, city, district, neighborhood)
}

export async function findSimilarProjects(opts: {
  name: string
  citySlug: string
  statuses?: ProjectStatus[]
}) {
  if (!isDatabaseConfigured() || !(await isDatabaseReachable())) return []
  const statuses = opts.statuses ?? (["APPROVED", "PENDING"] as ProjectStatus[])
  try {
    const rows = await prisma.project.findMany({
      where: {
        citySlug: opts.citySlug,
        status: { in: statuses },
        projectKind: { in: RESIDENTIAL_PROJECT_KINDS },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        citySlug: true,
      },
      take: 80,
    })
    return rows.filter((r) => namesLikelySame(r.name, opts.name))
  } catch {
    return []
  }
}

export async function resolveComplexLabel(
  loc: {
    city: string
    district: string
    neighborhood: string
    complex?: string
  },
  fallbackName?: string | null
): Promise<string | null> {
  if (!loc.complex) return null
  const staticLabel = getComplex(
    loc.city,
    loc.district,
    loc.neighborhood,
    loc.complex
  )?.label
  if (staticLabel) return toEnglishDigits(staticLabel)
  if (fallbackName?.trim()) return toEnglishDigits(fallbackName.trim())
  if (!isDatabaseConfigured()) return loc.complex
  try {
    const p = await prisma.project.findFirst({
      where: { slug: loc.complex },
      select: { name: true },
    })
    return toEnglishDigits(p?.name ?? loc.complex)
  } catch {
    return loc.complex
  }
}

export function uniqueProjectSlug(name: string, suffix?: string): string {
  const base = slugifyProjectName(name)
  return suffix ? `${base}-${suffix}` : base
}

export type PendingProjectCreateInput = {
  name: string
  citySlug: string
  districtSlug: string
  neighborhoodSlug: string
  createdById: string
  projectKind?: ProjectKind
}

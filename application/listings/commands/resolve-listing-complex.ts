/**
 * Resolve listing complexSlug / proposedComplexName — may create PENDING Project.
 */
import type { ParsedListingForm } from "@/application/listings/commands/parse-listing-form"
import { slugifyProjectName } from "@/lib/agency-directory"
import { findSimilarProjects } from "@/lib/complex-options"
import { prisma } from "@/lib/db"
import { inferCommercialFromName } from "@/lib/project-kinds"

export type ResolvedComplex = {
  complexSlug: string | null
  proposedComplexName: string | null
}

export async function resolveListingComplexFields(
  data: ParsedListingForm,
  userId: string
): Promise<ResolvedComplex | { error: string }> {
  if (!data.inComplex) {
    return { complexSlug: null, proposedComplexName: null }
  }

  if (data.complexSlug && !data.proposedComplexName) {
    return {
      complexSlug: data.complexSlug,
      proposedComplexName: null,
    }
  }

  const name = data.proposedComplexName?.trim()
  if (!name || name.length < 2) {
    return { error: "أدخل اسم المجمع المقترح." }
  }
  if (inferCommercialFromName(name)) {
    return {
      error:
        "اسم المجمع يبدو تجارياً (مول/مركز تسوق). اختر مجمعاً سكنياً أو تواصل مع الإدارة.",
    }
  }

  const similar = await findSimilarProjects({
    name,
    citySlug: data.citySlug,
    statuses: ["APPROVED", "PENDING"],
  })
  if (similar.length > 0) {
    const hit = similar[0]
    if (hit.status === "APPROVED") {
      return {
        error: `المجمع «${hit.name}» موجود — اختره من القائمة.`,
      }
    }
    return {
      complexSlug: hit.slug,
      proposedComplexName: name,
    }
  }

  let slug = slugifyProjectName(name)
  const clash = await prisma.project.findUnique({ where: { slug } })
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`

  await prisma.project.create({
    data: {
      name,
      slug,
      status: "PENDING",
      projectKind: "RESIDENTIAL",
      citySlug: data.citySlug,
      districtSlug: data.districtSlug,
      neighborhoodSlug: data.neighborhoodSlug,
      summary: "مجمّع مقترح مع إعلان — بانتظار موافقة الإدارة.",
      createdById: userId,
    },
  })

  return { complexSlug: slug, proposedComplexName: name }
}

"use server"

import { revalidatePath } from "next/cache"
import type { ProjectKind } from "@prisma/client"

import { uploadProjectCoverFile } from "@/lib/agency-assets"
import { slugifyProjectName } from "@/lib/agency-directory"
import { requireAdmin } from "@/lib/auth"
import {
  findSimilarProjects,
  namesLikelySame,
} from "@/lib/complex-options"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { inferCommercialFromName } from "@/lib/project-kinds"

export type AdminProjectActionState = {
  error?: string
  success?: string
}

function parseKind(raw: string): ProjectKind | null {
  if (raw === "RESIDENTIAL" || raw === "MIXED_USE" || raw === "COMMERCIAL") {
    return raw
  }
  return null
}

async function uniqueSlug(name: string): Promise<string> {
  let slug = slugifyProjectName(name)
  const clash = await prisma.project.findUnique({ where: { slug } })
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`
  return slug
}

function revalidateProjects(slug?: string) {
  revalidatePath("/admin/projects")
  revalidatePath("/projects")
  revalidatePath("/dashboard/agency-projects")
  revalidatePath("/agencies")
  revalidatePath("/")
  if (slug) revalidatePath(`/projects/${slug}`)
}

export async function adminCreateProjectAction(
  _prev: AdminProjectActionState,
  formData: FormData
): Promise<AdminProjectActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: "غير مصرّح." }
  }
  if (!isDatabaseConfigured()) return { error: "قاعدة البيانات غير مُعدّة." }

  const name = String(formData.get("name") ?? "").trim()
  const summary = String(formData.get("summary") ?? "").trim() || null
  const citySlug = String(formData.get("citySlug") ?? "").trim() || null
  const districtSlug = String(formData.get("districtSlug") ?? "").trim() || null
  const neighborhoodSlug =
    String(formData.get("neighborhoodSlug") ?? "").trim() || null
  const kind = parseKind(String(formData.get("projectKind") ?? "RESIDENTIAL"))
  const imageFile = formData.get("image")
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim() || null

  if (name.length < 2) return { error: "أدخل اسم المشروع." }
  if (!kind) return { error: "نوع المشروع غير صالح." }
  if (kind !== "COMMERCIAL" && inferCommercialFromName(name)) {
    return {
      error:
        "الاسم يشبه مركزاً تجارياً — اختر نوع «تجاري» أو غيّر الاسم لمشروع سكني.",
    }
  }
  if (citySlug) {
    const similar = await findSimilarProjects({
      name,
      citySlug,
      statuses: ["APPROVED", "PENDING"],
    })
    if (similar.length > 0) {
      return {
        error: `يوجد مشروع مشابه: «${similar[0].name}». عدّل الموجود بدل الإنشاء.`,
      }
    }
  }

  let imageUrl: string | null = null
  if (imageFile instanceof File && imageFile.size > 0) {
    const admin = await requireAdmin()
    const uploaded = await uploadProjectCoverFile(admin.id, imageFile)
    if ("error" in uploaded) return { error: uploaded.error }
    imageUrl = uploaded.url
  }

  const slug = await uniqueSlug(name)
  await prisma.project.create({
    data: {
      name,
      slug,
      summary,
      citySlug,
      districtSlug,
      neighborhoodSlug,
      projectKind: kind,
      websiteUrl,
      imageUrl,
      status: "APPROVED",
      reviewedAt: new Date(),
    },
  })

  revalidateProjects(slug)
  return { success: `تم إنشاء مشروع «${name}» ونشره.` }
}

export async function adminUpdateProjectAction(
  _prev: AdminProjectActionState,
  formData: FormData
): Promise<AdminProjectActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: "غير مصرّح." }
  }
  if (!isDatabaseConfigured()) return { error: "قاعدة البيانات غير مُعدّة." }

  const id = String(formData.get("projectId") ?? "").trim()
  const name = String(formData.get("name") ?? "").trim()
  const summary = String(formData.get("summary") ?? "").trim() || null
  const citySlug = String(formData.get("citySlug") ?? "").trim() || null
  const districtSlug = String(formData.get("districtSlug") ?? "").trim() || null
  const neighborhoodSlug =
    String(formData.get("neighborhoodSlug") ?? "").trim() || null
  const kind = parseKind(String(formData.get("projectKind") ?? "RESIDENTIAL"))
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim() || null

  if (!id) return { error: "معرّف مفقود." }
  if (name.length < 2) return { error: "أدخل اسم المشروع." }
  if (!kind) return { error: "نوع المشروع غير صالح." }

  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing) return { error: "المشروع غير موجود." }

  if (citySlug && !namesLikelySame(existing.name, name)) {
    const similar = await findSimilarProjects({
      name,
      citySlug,
      statuses: ["APPROVED", "PENDING"],
    })
    const clash = similar.find((s) => s.id !== id)
    if (clash) {
      return { error: `اسم مشابه لمشروع آخر: «${clash.name}».` }
    }
  }

  await prisma.project.update({
    where: { id },
    data: {
      name,
      summary,
      citySlug,
      districtSlug,
      neighborhoodSlug,
      projectKind: kind,
      websiteUrl,
    },
  })

  revalidateProjects(existing.slug)
  return { success: "تم تحديث المشروع." }
}

export async function adminUpdateProjectCoverAction(
  _prev: AdminProjectActionState,
  formData: FormData
): Promise<AdminProjectActionState> {
  try {
    const admin = await requireAdmin()
    if (!isDatabaseConfigured()) return { error: "قاعدة البيانات غير مُعدّة." }

    const id = String(formData.get("projectId") ?? "").trim()
    const imageFile = formData.get("image")
    if (!id) return { error: "معرّف مفقود." }
    if (!(imageFile instanceof File) || imageFile.size === 0) {
      return { error: "اختر صورة غلاف." }
    }

    const project = await prisma.project.findUnique({ where: { id } })
    if (!project) return { error: "المشروع غير موجود." }

    const uploaded = await uploadProjectCoverFile(admin.id, imageFile)
    if ("error" in uploaded) return { error: uploaded.error }

    await prisma.project.update({
      where: { id },
      data: { imageUrl: uploaded.url },
    })

    revalidateProjects(project.slug)
    return { success: "تم تحديث الغلاف." }
  } catch {
    return { error: "غير مصرّح." }
  }
}

export async function adminArchiveProjectAction(
  projectId: string
): Promise<AdminProjectActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: "غير مصرّح." }
  }
  if (!isDatabaseConfigured()) return { error: "قاعدة البيانات غير مُعدّة." }

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return { error: "المشروع غير موجود." }

  await prisma.project.update({
    where: { id: projectId },
    data: { status: "ARCHIVED", reviewedAt: new Date() },
  })

  revalidateProjects(project.slug)
  return { success: "تم أرشفة المشروع (مخفي من الدليل والاختيار)." }
}

export async function adminRestoreProjectAction(
  projectId: string
): Promise<AdminProjectActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: "غير مصرّح." }
  }
  if (!isDatabaseConfigured()) return { error: "قاعدة البيانات غير مُعدّة." }

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return { error: "المشروع غير موجود." }
  if (project.status !== "ARCHIVED") {
    return { error: "المشروع ليس مؤرشفاً." }
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { status: "APPROVED", reviewedAt: new Date() },
  })

  revalidateProjects(project.slug)
  return { success: "أُعيد نشر المشروع." }
}

export async function adminDeleteProjectAction(
  projectId: string
): Promise<AdminProjectActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: "غير مصرّح." }
  }
  if (!isDatabaseConfigured()) return { error: "قاعدة البيانات غير مُعدّة." }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      _count: { select: { agencies: true, photos: true } },
    },
  })
  if (!project) return { error: "المشروع غير موجود." }

  const listingCount = await prisma.listing.count({
    where: { complexSlug: project.slug },
  })
  if (
    listingCount > 0 ||
    project._count.agencies > 0 ||
    project._count.photos > 0
  ) {
    return {
      error:
        "لا يمكن الحذف — توجد إعلانات أو وكالات أو صور مرتبطة. استخدم الأرشفة.",
    }
  }

  await prisma.project.delete({ where: { id: projectId } })
  revalidateProjects(project.slug)
  return { success: "حُذف المشروع نهائياً." }
}

/** Exactly one official sales desk per project. */
export async function setOfficialSalesDeskAction(
  projectId: string,
  agencyUserId: string
): Promise<AdminProjectActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: "غير مصرّح." }
  }
  if (!isDatabaseConfigured()) return { error: "قاعدة البيانات غير مُعدّة." }

  const link = await prisma.agencyProject.findUnique({
    where: {
      userId_projectId: { userId: agencyUserId, projectId },
    },
    include: { project: { select: { slug: true, name: true } } },
  })
  if (!link) return { error: "الوكالة غير مربوطة بهذا المشروع." }

  await prisma.$transaction([
    prisma.agencyProject.updateMany({
      where: { projectId },
      data: { isOfficialSalesDesk: false },
    }),
    prisma.agencyProject.update({
      where: {
        userId_projectId: { userId: agencyUserId, projectId },
      },
      data: { isOfficialSalesDesk: true },
    }),
  ])

  revalidateProjects(link.project.slug)
  revalidatePath(`/projects/${link.project.slug}`)
  return { success: "تم تعيين مركز المبيعات الرسمي." }
}

export async function clearOfficialSalesDeskAction(
  projectId: string
): Promise<AdminProjectActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: "غير مصرّح." }
  }
  if (!isDatabaseConfigured()) return { error: "قاعدة البيانات غير مُعدّة." }

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return { error: "المشروع غير موجود." }

  await prisma.agencyProject.updateMany({
    where: { projectId },
    data: { isOfficialSalesDesk: false },
  })

  revalidateProjects(project.slug)
  return { success: "أُزيل تعيين مركز المبيعات الرسمي." }
}

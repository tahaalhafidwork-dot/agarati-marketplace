"use server"

import { revalidatePath } from "next/cache"

import { uploadProjectCoverFile } from "@/lib/agency-assets"
import { requireAgencyOwner } from "@/lib/agency-service"
import { requireAdmin, requireSessionUser } from "@/lib/auth"
import { slugifyProjectName } from "@/lib/agency-directory"
import { inferCommercialFromName, RESIDENTIAL_PROJECT_KINDS } from "@/lib/project-kinds"
import { isDatabaseConfigured, prisma } from "@/lib/db"

export type AgencyProjectActionState = {
  error?: string
  success?: string
}

async function requireApprovedAgency() {
  const user = await requireSessionUser()
  await requireAgencyOwner(user.id)
  return user
}

export async function attachAgencyProjectAction(
  _prev: AgencyProjectActionState,
  formData: FormData
): Promise<AgencyProjectActionState> {
  if (!isDatabaseConfigured()) {
    return { error: "قاعدة البيانات غير مُعدّة." }
  }
  try {
    const user = await requireApprovedAgency()
    const projectId = String(formData.get("projectId") ?? "").trim()
    if (!projectId) return { error: "اختر مشروعاً." }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (
      !project ||
      project.status !== "APPROVED" ||
      !RESIDENTIAL_PROJECT_KINDS.includes(project.projectKind)
    ) {
      return { error: "يمكن الربط فقط بمشروع سكني أو سكني–تجاري موافق عليه." }
    }

    await prisma.agencyProject.upsert({
      where: {
        userId_projectId: { userId: user.id, projectId },
      },
      create: { userId: user.id, projectId },
      update: {},
    })

    revalidatePath("/dashboard/agency-projects")
    revalidatePath("/agencies")
    revalidatePath("/")
    return { success: `تم ربط مشروع «${project.name}».` }
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { error: "يجب تسجيل الدخول." }
    }
    if (
      e instanceof Error &&
      ["AGENCY_MEMBERSHIP_REQUIRED", "AGENCY_OWNER_REQUIRED"].includes(e.message)
    ) {
      return { error: "هذه الصفحة مخصصة لصاحب الوكالة فقط." }
    }
    return { error: "تعذّر ربط المشروع." }
  }
}

/** Propose a new project — stays PENDING until admin approves. */
export async function proposeProjectAction(
  _prev: AgencyProjectActionState,
  formData: FormData
): Promise<AgencyProjectActionState> {
  if (!isDatabaseConfigured()) {
    return { error: "قاعدة البيانات غير مُعدّة." }
  }
  try {
    const user = await requireApprovedAgency()
    const name = String(formData.get("projectName") ?? "").trim()
    const imageFile = formData.get("projectImage")

    if (name.length < 2) return { error: "أدخل اسم المشروع (حرفان على الأقل)." }
    if (inferCommercialFromName(name)) {
      return {
        error:
          "هذا الدليل للمشاريع السكنية أو السكني–التجاري فقط. مراكز التسوق تُدار خارج قائمة المشاريع السكنية.",
      }
    }

    let imageUrl: string | null = null
    if (imageFile instanceof File && imageFile.size > 0) {
      const uploaded = await uploadProjectCoverFile(user.id, imageFile)
      if ("error" in uploaded) return { error: uploaded.error }
      imageUrl = uploaded.url
    }

    let slug = slugifyProjectName(name)
    const clash = await prisma.project.findUnique({ where: { slug } })
    if (clash) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`
    }

    await prisma.project.create({
      data: {
        name,
        slug,
        imageUrl,
        status: "PENDING",
        projectKind: "RESIDENTIAL",
        createdById: user.id,
      },
    })

    revalidatePath("/dashboard/agency-projects")
    revalidatePath("/admin/projects")
    return {
      success:
        "تم الإرسال. بعد موافقة الإدارة يُضاف المشروع للدليل ويُربط بمكتبك — وستكمل الإدارة التفاصيل (الموقع والنبذة والصور).",
    }
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { error: "يجب تسجيل الدخول." }
    }
    if (
      e instanceof Error &&
      ["AGENCY_MEMBERSHIP_REQUIRED", "AGENCY_OWNER_REQUIRED"].includes(e.message)
    ) {
      return { error: "هذه الصفحة مخصصة لصاحب الوكالة فقط." }
    }
    return { error: "تعذّر إرسال الاقتراح." }
  }
}

/** @deprecated use proposeProjectAction */
export const createAndAttachProjectAction = proposeProjectAction

export async function detachAgencyProjectAction(
  _prev: AgencyProjectActionState,
  formData: FormData
): Promise<AgencyProjectActionState> {
  if (!isDatabaseConfigured()) {
    return { error: "قاعدة البيانات غير مُعدّة." }
  }
  try {
    const user = await requireApprovedAgency()
    const projectId = String(formData.get("projectId") ?? "").trim()
    if (!projectId) return { error: "معرّف المشروع مفقود." }

    await prisma.agencyProject.deleteMany({
      where: { userId: user.id, projectId },
    })

    revalidatePath("/dashboard/agency-projects")
    revalidatePath("/agencies")
    revalidatePath("/")
    return { success: "أُزيل المشروع من قائمتك." }
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { error: "يجب تسجيل الدخول." }
    }
    if (
      e instanceof Error &&
      ["AGENCY_MEMBERSHIP_REQUIRED", "AGENCY_OWNER_REQUIRED"].includes(e.message)
    ) {
      return { error: "هذه الصفحة مخصصة لصاحب الوكالة فقط." }
    }
    return { error: "تعذّر إزالة المشروع." }
  }
}

export async function reviewProjectAction(
  projectId: string,
  decision: "APPROVED" | "REJECTED"
): Promise<AgencyProjectActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: "غير مصرّح." }
  }
  if (!isDatabaseConfigured()) return { error: "قاعدة البيانات غير مُعدّة." }

  const id = projectId.trim()
  if (!id) return { error: "معرّف مفقود." }

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return { error: "المشروع غير موجود." }
  if (project.status !== "PENDING") {
    return { error: "لا يوجد اقتراح معلّق لهذا المشروع." }
  }

  await prisma.project.update({
    where: { id },
    data: {
      status: decision,
      reviewedAt: new Date(),
    },
  })

  if (decision === "APPROVED" && project.createdById) {
    await prisma.agencyProject.upsert({
      where: {
        userId_projectId: {
          userId: project.createdById,
          projectId: id,
        },
      },
      create: {
        userId: project.createdById,
        projectId: id,
      },
      update: {},
    })
  }

  revalidatePath("/admin/projects")
  revalidatePath("/dashboard/agency-projects")
  revalidatePath("/agencies")
  revalidatePath("/")
  revalidatePath(`/projects/${project.slug}`)

  return {
    success:
      decision === "APPROVED"
        ? "تمت الموافقة على المشروع وإدراجه في الدليل."
        : "تم رفض اقتراح المشروع.",
  }
}

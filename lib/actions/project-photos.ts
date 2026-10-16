"use server"

import { revalidatePath } from "next/cache"

import { uploadProjectGalleryFile } from "@/lib/agency-assets"
import { requireAdmin, requireSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { PROJECT_GALLERY_MAX } from "@/lib/project-gallery"

export type ProjectPhotoActionState = {
  error?: string
  success?: string
}

/** Any signed-in user may contribute a photo; stays PENDING until admin approves. */
export async function contributeProjectPhotoAction(
  _prev: ProjectPhotoActionState,
  formData: FormData
): Promise<ProjectPhotoActionState> {
  if (!isDatabaseConfigured()) {
    return { error: "قاعدة البيانات غير مُعدّة." }
  }

  try {
    const user = await requireSessionUser()
    const projectId = String(formData.get("projectId") ?? "").trim()
    const imageFile = formData.get("photo")

    if (!projectId) return { error: "معرّف المشروع مفقود." }
    if (!(imageFile instanceof File) || imageFile.size === 0) {
      return { error: "التقط أو اختر صورة للمشاركة." }
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, status: "APPROVED" },
      select: { id: true, slug: true, name: true },
    })
    if (!project) return { error: "المشروع غير متاح للمشاركة." }

    const approvedCount = await prisma.projectPhoto.count({
      where: { projectId, status: "APPROVED" },
    })
    if (approvedCount >= PROJECT_GALLERY_MAX) {
      return {
        error: `معرض المشروع ممتلئ (حد أقصى ${PROJECT_GALLERY_MAX} صورة).`,
      }
    }

    const pendingFromUser = await prisma.projectPhoto.count({
      where: {
        projectId,
        contributorId: user.id,
        status: "PENDING",
      },
    })
    if (pendingFromUser >= 3) {
      return {
        error: "لديك صور معلّقة للمراجعة على هذا المشروع. انتظر موافقة الإدارة.",
      }
    }

    const uploaded = await uploadProjectGalleryFile(
      user.id,
      projectId,
      imageFile
    )
    if ("error" in uploaded) return { error: uploaded.error }

    const displayName =
      user.agencyOfficeName?.trim() || user.name.trim() || "مساهم"

    await prisma.projectPhoto.create({
      data: {
        projectId,
        storagePath: uploaded.path,
        status: "PENDING",
        contributorId: user.id,
        contributorName: displayName,
      },
    })

    revalidatePath(`/projects/${project.slug}`)
    revalidatePath("/admin/projects")

    return {
      success:
        "شكراً لمشاركتك. ستظهر الصورة في المعرض بعد موافقة الإدارة وباسمك وتاريخ الإرسال.",
    }
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { error: "سجّل الدخول لمشاركة صورة المشروع." }
    }
    return { error: "تعذّر إرسال الصورة." }
  }
}

export async function reviewProjectPhotoAction(
  photoId: string,
  decision: "APPROVED" | "REJECTED"
): Promise<ProjectPhotoActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: "غير مصرّح." }
  }
  if (!isDatabaseConfigured()) return { error: "قاعدة البيانات غير مُعدّة." }

  const id = photoId.trim()
  if (!id) return { error: "معرّف مفقود." }

  const photo = await prisma.projectPhoto.findUnique({
    where: { id },
    include: { project: { select: { slug: true, id: true } } },
  })
  if (!photo) return { error: "الصورة غير موجودة." }
  if (photo.status !== "PENDING") {
    return { error: "لا توجد مراجعة معلّقة لهذه الصورة." }
  }

  if (decision === "APPROVED") {
    const approvedCount = await prisma.projectPhoto.count({
      where: { projectId: photo.projectId, status: "APPROVED" },
    })
    if (approvedCount >= PROJECT_GALLERY_MAX) {
      return {
        error: `معرض المشروع ممتلئ (حد أقصى ${PROJECT_GALLERY_MAX} صورة). ارفض أو احذف صوراً أولاً.`,
      }
    }
  }

  await prisma.projectPhoto.update({
    where: { id },
    data: {
      status: decision,
      reviewedAt: new Date(),
    },
  })

  revalidatePath("/admin/projects")
  revalidatePath(`/projects/${photo.project.slug}`)

  return {
    success:
      decision === "APPROVED"
        ? "تمت الموافقة — الصورة في معرض المشروع."
        : "تم رفض الصورة.",
  }
}

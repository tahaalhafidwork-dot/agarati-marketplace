"use server"

import { revalidatePath } from "next/cache"
import type { ReportKind } from "@prisma/client"

import { getSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"

export type ReportActionState = {
  error?: string
  success?: string
  referenceCode?: string
}

const KIND_VALUES = new Set<ReportKind>([
  "MISLEADING_LISTING",
  "FRAUD",
  "ILLEGAL_CONTENT",
  "IMPERSONATION",
  "TECHNICAL",
  "OTHER",
])

function makeReferenceCode() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6)
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6)
  return `R-${stamp}${rand}`
}

export async function submitReportAction(
  _prev: ReportActionState,
  formData: FormData
): Promise<ReportActionState> {
  const kindRaw = String(formData.get("kind") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const listingRef = String(formData.get("listingRef") ?? "").trim() || null
  const contactEmail = String(formData.get("contactEmail") ?? "").trim() || null
  const contactPhone = String(formData.get("contactPhone") ?? "").trim() || null
  const confirmed = formData.get("confirm") === "on"

  if (!KIND_VALUES.has(kindRaw as ReportKind)) {
    return { error: "اختر نوع البلاغ." }
  }
  if (description.length < 20) {
    return { error: "اكتب وصفاً أوضح (٢٠ حرفاً على الأقل) حتى نتمكّن من المراجعة." }
  }
  if (description.length > 4000) {
    return { error: "الوصف طويل جداً — اختصره إلى ٤٠٠٠ حرف كحد أقصى." }
  }
  if (!confirmed) {
    return { error: "يجب تأكيد أن البلاغ صحيح وعلى مسؤوليتك." }
  }
  if (!contactEmail && !contactPhone) {
    return { error: "أضف بريداً أو هاتفاً للتواصل عند الحاجة." }
  }
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return { error: "صيغة البريد غير صحيحة." }
  }

  if (!isDatabaseConfigured()) {
    return {
      error:
        "تعذّر حفظ البلاغ حالياً (قاعدة البيانات غير مُعدّة). حاول لاحقاً أو راسل صفحة التواصل.",
    }
  }

  const user = await getSessionUser()
  const kind = kindRaw as ReportKind

  try {
    let referenceCode = makeReferenceCode()
    for (let i = 0; i < 3; i++) {
      const exists = await prisma.report.findUnique({
        where: { referenceCode },
        select: { id: true },
      })
      if (!exists) break
      referenceCode = makeReferenceCode()
    }

    await prisma.report.create({
      data: {
        referenceCode,
        kind,
        description,
        listingRef,
        contactEmail,
        contactPhone,
        reporterUserId: user?.id ?? null,
      },
    })

    revalidatePath("/admin/reports")

    return {
      success:
        "تم استلام بلاغك. سنراجعه وفق الأولوية المتاحة — لا يعني الاستلام إقراراً بصحة الادعاء أو اتخاذ إجراء فوري.",
      referenceCode,
    }
  } catch {
    return { error: "تعذّر حفظ البلاغ. أعد المحاولة بعد لحظات." }
  }
}

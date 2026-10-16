"use server"

import { revalidatePath } from "next/cache"

import { requireSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { publicListingVisibilityWhere } from "@/lib/listing-quota"
import { normalizeIraqPhone } from "@/lib/phone"

export async function submitContactLeadAction(
  _prev: { error?: string; success?: string },
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  if (!isDatabaseConfigured()) {
    return { error: "قاعدة البيانات غير مُعدّة." }
  }

  const listingId = String(formData.get("listingId") ?? "")
  const fromName = String(formData.get("fromName") ?? "").trim()
  const fromPhoneRaw = String(formData.get("fromPhone") ?? "").trim()
  const message = String(formData.get("message") ?? "").trim()

  if (!listingId || !fromName || !fromPhoneRaw || !message) {
    return { error: "أكمل جميع الحقول." }
  }

  const fromPhone = normalizeIraqPhone(fromPhoneRaw)
  if (!fromPhone) {
    return { error: "أدخل رقم هاتف عراقي صالح (مثال: 07xxxxxxxx)." }
  }

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ...publicListingVisibilityWhere() },
  })
  if (!listing) {
    return {
      error:
        "هذا الإعلان تجريبي أو غير متاح لطلبات التواصل. جرّب إعلاناً منشوراً من المعلنين.",
    }
  }

  await prisma.contactLead.create({
    data: {
      listingId,
      ownerId: listing.ownerId,
      fromName,
      fromPhone,
      message,
    },
  })

  revalidatePath("/dashboard/contact-leads")
  return { success: "تم إرسال طلبك للمعلن. سيظهر في صندوق طلبات التواصل." }
}

export async function markContactLeadReadAction(leadId: string) {
  const user = await requireSessionUser()
  if (!isDatabaseConfigured()) throw new Error("DB_NOT_CONFIGURED")

  const lead = await prisma.contactLead.findUnique({ where: { id: leadId } })
  if (!lead || lead.ownerId !== user.id) throw new Error("FORBIDDEN")

  await prisma.contactLead.update({
    where: { id: leadId },
    data: { status: "READ" },
  })
  revalidatePath("/dashboard/contact-leads")
}

export async function archiveContactLeadAction(leadId: string) {
  const user = await requireSessionUser()
  if (!isDatabaseConfigured()) throw new Error("DB_NOT_CONFIGURED")

  const lead = await prisma.contactLead.findUnique({ where: { id: leadId } })
  if (!lead || lead.ownerId !== user.id) throw new Error("FORBIDDEN")

  await prisma.contactLead.update({
    where: { id: leadId },
    data: { status: "ARCHIVED" },
  })
  revalidatePath("/dashboard/contact-leads")
}

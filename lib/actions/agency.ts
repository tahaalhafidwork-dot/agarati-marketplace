"use server"

import { revalidatePath } from "next/cache"

import { requireSessionUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  acceptAgencyInvitation,
  acceptAgencyInvitationById,
  createAgencyInvitation,
  leaveAgency,
  reassignAgencyListing,
  removeAgencyAgent,
  revokeAgencyInvitation,
  updateAgencyQuotas,
} from "@/lib/agency-membership-service"
import { requireAgencyOwner } from "@/lib/agency-service"
import { requestAgencySubscriptionPayment } from "@/lib/payment-service"

export type AgencyActionState = {
  error?: string
  success?: string
  invitationUrl?: string
}

const errorMessages: Record<string, string> = {
  INVALID_INVITATION_EMAIL: "أدخل بريدًا إلكترونيًا صحيحًا.",
  INVALID_MEMBER_QUOTA: "الحصة يجب أن تكون بين 0 و30.",
  CANNOT_INVITE_SELF: "لا يمكنك دعوة حسابك نفسه.",
  USER_ALREADY_IN_AGENCY: "المستخدم عضو نشط في وكالة أخرى.",
  ACCOUNT_NOT_ELIGIBLE_AS_AGENT:
    "لا يمكن إضافة حساب وكالة أو حساب لديه طلب تحويل معلّق كوكيل. الوكيل يجب أن يكون حسابًا فرديًا.",
  USER_NOT_FOUND: "الحساب المدعو غير موجود.",
  AGENCY_QUOTA_TOTAL_EXCEEDED: "مجموع الحصص اليدوية يتجاوز 30 إعلانًا.",
  INVITATION_NOT_FOUND: "الدعوة غير موجودة.",
  INVITATION_NOT_PENDING: "هذه الدعوة لم تعد متاحة.",
  INVITATION_ALREADY_USED: "استُخدمت هذه الدعوة سابقًا.",
  INVITATION_EXPIRED: "انتهت صلاحية الدعوة.",
  INVITATION_EMAIL_MISMATCH: "سجّل الدخول بالبريد الذي أُرسلت إليه الدعوة.",
  AGENCY_OWNER_REQUIRED: "هذه العملية متاحة لصاحب الوكالة فقط.",
  AGENCY_MEMBERSHIP_REQUIRED: "لا توجد عضوية وكالة نشطة.",
  OWNER_CANNOT_LEAVE: "لا يمكن لصاحب الوكالة المغادرة قبل نقل الملكية.",
  AGENCY_MEMBER_NOT_FOUND: "الوكيل غير موجود أو غادر الوكالة.",
  AGENCY_LISTING_NOT_FOUND: "عقار الوكالة غير موجود.",
  AGENCY_MEMBER_QUOTA_REACHED: "وصل الوكيل إلى حصته الحالية.",
  INVALID_AGENCY_URL: "روابط الوكالة يجب أن تبدأ بـ http أو https.",
  UNAUTHORIZED: "يجب تسجيل الدخول أولًا.",
}

function actionError(error: unknown): AgencyActionState {
  const key = error instanceof Error ? error.message : ""
  return { error: errorMessages[key] ?? "تعذّر إكمال العملية. حاول مرة أخرى." }
}

function revalidateAgency() {
  revalidatePath("/dashboard/agency")
  revalidatePath("/dashboard/agency/agents")
  revalidatePath("/dashboard/agency/subscription")
  revalidatePath("/dashboard/messages")
  revalidatePath("/dashboard/properties")
  revalidatePath("/agencies")
}

export async function inviteAgencyAgentAction(
  _previous: AgencyActionState,
  formData: FormData
): Promise<AgencyActionState> {
  try {
    const user = await requireSessionUser()
    const result = await createAgencyInvitation({
      ownerId: user.id,
      email: String(formData.get("email") ?? ""),
      manualQuota: Number(formData.get("manualQuota") ?? 0),
    })
    revalidateAgency()
    return {
      success: result.invitation.invitedUserId
        ? "أُنشئت الدعوة وأُرسل تنبيه داخل حساب الوكيل. يمكن مشاركة الرابط أيضًا."
        : "أُنشئت الدعوة. البريد غير مسجل حاليًا؛ شارك الرابط الآمن مع الوكيل.",
      invitationUrl: `/agency/invitations/${result.token}`,
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function acceptAgencyInvitationAction(
  _previous: AgencyActionState,
  formData: FormData
): Promise<AgencyActionState> {
  try {
    const user = await requireSessionUser()
    await acceptAgencyInvitation({
      token: String(formData.get("token") ?? ""),
      userId: user.id,
      userEmail: user.email,
    })
    revalidateAgency()
    return { success: "انضممت إلى الوكالة بنجاح." }
  } catch (error) {
    return actionError(error)
  }
}

export async function acceptAgencyInvitationByIdAction(
  _previous: AgencyActionState,
  formData: FormData
): Promise<AgencyActionState> {
  try {
    const user = await requireSessionUser()
    await acceptAgencyInvitationById({
      invitationId: String(formData.get("invitationId") ?? ""),
      userId: user.id,
      userEmail: user.email,
    })
    revalidateAgency()
    revalidatePath("/dashboard/messages")
    return { success: "تم قبول الدعوة والانضمام إلى الوكالة بنجاح." }
  } catch (error) {
    return actionError(error)
  }
}

export async function updateAgencyQuotasAction(
  _previous: AgencyActionState,
  formData: FormData
): Promise<AgencyActionState> {
  try {
    const user = await requireSessionUser()
    const mode = formData.get("mode") === "MANUAL" ? "MANUAL" : "EQUAL"
    const quotas: Record<string, number> = {}
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("quota:")) {
        quotas[key.slice("quota:".length)] = Math.max(0, Math.trunc(Number(value)))
      }
    }
    await updateAgencyQuotas({ ownerId: user.id, mode, quotas })
    revalidateAgency()
    return { success: "حُفظ توزيع الحصص." }
  } catch (error) {
    return actionError(error)
  }
}

export async function removeAgencyAgentAction(formData: FormData) {
  const user = await requireSessionUser()
  await removeAgencyAgent({
    ownerId: user.id,
    membershipId: String(formData.get("membershipId") ?? ""),
  })
  revalidateAgency()
}

export async function revokeAgencyInvitationAction(formData: FormData) {
  const user = await requireSessionUser()
  await revokeAgencyInvitation({
    ownerId: user.id,
    invitationId: String(formData.get("invitationId") ?? ""),
  })
  revalidateAgency()
}

export async function leaveAgencyAction() {
  const user = await requireSessionUser()
  await leaveAgency(user.id)
  revalidateAgency()
}

export async function reassignAgencyListingAction(formData: FormData) {
  const user = await requireSessionUser()
  await reassignAgencyListing({
    ownerId: user.id,
    listingId: String(formData.get("listingId") ?? ""),
    assigneeUserId: String(formData.get("assigneeUserId") ?? "").trim() || null,
  })
  revalidateAgency()
}

export async function requestAgencySubscriptionAction(): Promise<AgencyActionState> {
  try {
    const user = await requireSessionUser()
    await requestAgencySubscriptionPayment(user.id)
    revalidateAgency()
    revalidatePath("/admin/payments")
    return {
      success: "سُجل طلب اشتراك بقيمة 40,000 د.ع دون أي خصم تلقائي.",
    }
  } catch (error) {
    return actionError(error)
  }
}

export async function updateAgencyProfileAction(
  _previous: AgencyActionState,
  formData: FormData
): Promise<AgencyActionState> {
  try {
    const user = await requireSessionUser()
    const membership = await requireAgencyOwner(user.id)
    const read = (name: string) => String(formData.get(name) ?? "").trim() || null
    const readUrl = (name: string) => {
      const value = read(name)
      if (!value) return null
      let parsed: URL
      try {
        parsed = new URL(value)
      } catch {
        throw new Error("INVALID_AGENCY_URL")
      }
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error("INVALID_AGENCY_URL")
      }
      return parsed.toString()
    }
    const name = read("name")
    if (!name) return { error: "اسم المكتب مطلوب." }
    const latRaw = read("mapLat")
    const lngRaw = read("mapLng")
    const mapLat = latRaw == null ? null : Number(latRaw)
    const mapLng = lngRaw == null ? null : Number(lngRaw)
    if (
      (mapLat != null && (!Number.isFinite(mapLat) || mapLat < -90 || mapLat > 90)) ||
      (mapLng != null && (!Number.isFinite(mapLng) || mapLng < -180 || mapLng > 180))
    ) {
      return { error: "إحداثيات الخريطة غير صحيحة." }
    }
    await prisma.agency.update({
      where: { id: membership.agencyId },
      data: {
        name,
        bio: read("bio"),
        logoUrl: readUrl("logoUrl"),
        coverUrl: readUrl("coverUrl"),
        phone: read("phone"),
        whatsapp: read("whatsapp"),
        websiteUrl: readUrl("websiteUrl"),
        instagramUrl: readUrl("instagramUrl"),
        facebookUrl: readUrl("facebookUrl"),
        citySlug: read("citySlug"),
        districtSlug: read("districtSlug"),
        neighborhoodSlug: read("neighborhoodSlug"),
        addressLine: read("addressLine"),
        mapLat,
        mapLng,
      },
    })
    revalidateAgency()
    revalidatePath(`/agencies/${membership.agency.slug}`)
    return { success: "حُفظت صفحة الوكالة العامة." }
  } catch (error) {
    return actionError(error)
  }
}

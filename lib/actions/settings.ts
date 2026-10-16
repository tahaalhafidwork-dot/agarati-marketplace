"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdmin, requireSessionUser } from "@/lib/auth"
import {
  normalizeAgencySocialUrl,
  uploadAgencyLogoFile,
} from "@/lib/agency-assets"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { createServiceClient } from "@/lib/supabase/admin"
import {
  avatarPublicUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"

export type SettingsActionState = {
  error?: string
  success?: string
}

async function requireDbUser() {
  if (!isDatabaseConfigured() || !isSupabaseConfigured()) {
    throw new Error("CONFIG")
  }
  return requireSessionUser()
}

export async function updateProfileAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    const user = await requireDbUser()
    const name = String(formData.get("name") ?? "").trim()
    const phone = String(formData.get("phone") ?? "").trim() || null

    if (!name || name.length < 2) {
      return { error: "الاسم مطلوب (حرفان على الأقل)." }
    }

    const supabase = await createClient()
    const { error: metaError } = await supabase.auth.updateUser({
      data: { name, phone },
    })
    if (metaError) return { error: metaError.message }

    await prisma.user.update({
      where: { id: user.id },
      data: { name, phone, whatsapp: phone },
    })

    revalidatePath("/dashboard/settings")
    revalidatePath("/")
    return { success: "تم تحديث الملف الشخصي." }
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { error: "يجب تسجيل الدخول." }
    }
    if (e instanceof Error && e.message === "CONFIG") {
      return { error: "الإعدادات غير مُعدّة بالكامل." }
    }
    return { error: "تعذّر حفظ الملف الشخصي." }
  }
}

export async function updateEmailAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    const user = await requireDbUser()
    const email = String(formData.get("email") ?? "").trim().toLowerCase()
    if (!email || !email.includes("@")) {
      return { error: "بريد غير صالح." }
    }
    if (email === user.email) {
      return { success: "البريد الحالي دون تغيير." }
    }

    const taken = await prisma.user.findFirst({
      where: { email, NOT: { id: user.id } },
      select: { id: true },
    })
    if (taken) return { error: "هذا البريد مستخدم لحساب آخر." }

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ email })
    if (error) return { error: error.message }

    await prisma.user.update({
      where: { id: user.id },
      data: { email },
    })

    revalidatePath("/dashboard/settings")
    return {
      success:
        "تم طلب تغيير البريد. إن طلب النظام تأكيداً، راجع صندوق الوارد للمتابعة.",
    }
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { error: "يجب تسجيل الدخول." }
    }
    return { error: "تعذّر تحديث البريد." }
  }
}

export async function updatePasswordAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    await requireDbUser()
    const password = String(formData.get("password") ?? "")
    const confirm = String(formData.get("confirmPassword") ?? "")

    if (password.length < 6) {
      return { error: "كلمة المرور ٦ أحرف على الأقل." }
    }
    if (password !== confirm) {
      return { error: "تأكيد كلمة المرور غير متطابق." }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { error: error.message }

    revalidatePath("/dashboard/settings")
    return { success: "تم تحديث كلمة المرور." }
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { error: "يجب تسجيل الدخول." }
    }
    return { error: "تعذّر تحديث كلمة المرور." }
  }
}

export async function updateAvatarAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    const user = await requireDbUser()
    const file = formData.get("avatar")
    if (!(file instanceof File) || file.size === 0) {
      return { error: "اختر صورة للرفع." }
    }
    if (file.size > 3 * 1024 * 1024) {
      return { error: "الحد الأقصى للصورة ٣ ميغابايت." }
    }
    if (!file.type.startsWith("image/")) {
      return { error: "الملف يجب أن يكون صورة." }
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    // RLS: first path segment must equal auth.uid() (see supabase/seed.sql)
    const path = `${user.id}/avatar/${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const supabase = await createClient()
    const { error } = await supabase.storage
      .from("listing-images")
      .upload(path, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      })
    if (error) return { error: error.message }

    const url = avatarPublicUrl(path)
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: url },
    })

    revalidatePath("/dashboard/settings")
    revalidatePath("/")
    return { success: "تم تحديث صورة الملف." }
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { error: "يجب تسجيل الدخول." }
    }
    return { error: "تعذّر رفع الصورة." }
  }
}

export async function updateNotificationPrefsAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    const user = await requireDbUser()
    const notifyMessages = formData.get("notifyMessages") === "on"
    const notifyOther = formData.get("notifyOther") === "on"

    await prisma.user.update({
      where: { id: user.id },
      data: { notifyMessages, notifyOther },
    })

    revalidatePath("/dashboard/settings")
    return { success: "تم حفظ تفضيلات الإشعارات." }
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { error: "يجب تسجيل الدخول." }
    }
    return { error: "تعذّر حفظ الإشعارات." }
  }
}

export async function requestAgencyUpgradeAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    const user = await requireDbUser()
    if (user.accountType === "AGENCY" || user.agencyUpgradeStatus === "APPROVED") {
      return { success: "حسابك مفعّل كوكيل عقاري — تجاري." }
    }
    if (user.agencyUpgradeStatus === "PENDING") {
      return { error: "طلبك قيد المراجعة حالياً." }
    }

    const officeName = String(formData.get("officeName") ?? "").trim() || null
    const note = String(formData.get("note") ?? "").trim() || null
    const socialRaw = String(formData.get("agencySocialUrl") ?? "").trim()
    const logoFile = formData.get("agencyLogo")
    const agencyCitySlug = String(formData.get("agencyCitySlug") ?? "").trim()
    const agencyDistrictSlug = String(
      formData.get("agencyDistrictSlug") ?? ""
    ).trim()
    const agencyNeighborhoodSlug = String(
      formData.get("agencyNeighborhoodSlug") ?? ""
    ).trim()
    const agencyAddressLine = String(
      formData.get("agencyAddressLine") ?? ""
    ).trim()
    const agencyBio = String(formData.get("agencyBio") ?? "").trim() || null

    if (!(logoFile instanceof File) || logoFile.size === 0) {
      return { error: "ارفع شعار المكتب — مطلوب لطلب الوكالة." }
    }
    if (
      !agencyCitySlug ||
      !agencyDistrictSlug ||
      !agencyNeighborhoodSlug ||
      agencyAddressLine.length < 3
    ) {
      return {
        error: "أدخل موقع المكتب الكامل (مدينة وقضاء وحي) وعنوان المكتب.",
      }
    }

    let agencySocialUrl: string | null = null
    if (socialRaw) {
      agencySocialUrl = normalizeAgencySocialUrl(socialRaw)
      if (!agencySocialUrl) {
        return { error: "رابط التواصل الاجتماعي غير صالح." }
      }
    }

    const uploaded = await uploadAgencyLogoFile(user.id, logoFile)
    if ("error" in uploaded) return { error: uploaded.error }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        agencyUpgradeStatus: "PENDING",
        agencyOfficeName: officeName,
        agencyLogoUrl: uploaded.url,
        agencySocialUrl,
        agencyCitySlug,
        agencyDistrictSlug,
        agencyNeighborhoodSlug,
        agencyAddressLine,
        agencyBio,
        agencyRequestNote: note,
        agencyRequestedAt: new Date(),
      },
    })

    revalidatePath("/dashboard/settings")
    revalidatePath("/admin/users")
    revalidatePath("/agencies")
    return { success: "تم إرسال طلب الترقية. سنراجعه قريباً." }
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { error: "يجب تسجيل الدخول." }
    }
    return { error: "تعذّر إرسال طلب الترقية." }
  }
}

export async function revokeOtherSessionsAction(): Promise<SettingsActionState> {
  try {
    await requireDbUser()
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut({ scope: "others" })
    if (error) return { error: error.message }
    return { success: "تم إنهاء الجلسات الأخرى. هذه الجلسة ما زالت نشطة." }
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { error: "يجب تسجيل الدخول." }
    }
    return { error: "تعذّر إنهاء الجلسات الأخرى." }
  }
}

export async function clearSearchHistoryAction(): Promise<SettingsActionState> {
  try {
    const user = await requireDbUser()
    await prisma.savedSearch.deleteMany({ where: { userId: user.id } })
    revalidatePath("/dashboard/settings")
    revalidatePath("/dashboard/favorites")
    revalidatePath("/properties")
    return {
      success:
        "تم مسح عمليات البحث المحفوظة. سجّل البحث المحلي على هذا الجهاز يُمسح من الواجهة أيضاً.",
    }
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { error: "يجب تسجيل الدخول." }
    }
    return { error: "تعذّر مسح سجل البحث." }
  }
}

export async function deleteAccountAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    const user = await requireDbUser()
    const confirm = String(formData.get("confirm") ?? "").trim()
    if (confirm !== "حذف حسابي") {
      return { error: "اكتب بالضبط: حذف حسابي للتأكيد." }
    }

    // Best-effort cascade via Prisma relations (onDelete) after user delete
    try {
      const admin = createServiceClient()
      await admin.auth.admin.deleteUser(user.id)
    } catch {
      // Fall through — still remove app profile if service role missing
    }

    try {
      await prisma.user.delete({ where: { id: user.id } })
    } catch {
      /* may already be gone via cascade from auth hooks */
    }

    const supabase = await createClient()
    await supabase.auth.signOut({ scope: "global" })

    revalidatePath("/")
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return { error: "يجب تسجيل الدخول." }
    }
    return { error: "تعذّر حذف الحساب. تواصل مع الدعم إن استمرت المشكلة." }
  }

  redirect("/?deleted=1")
}

export async function reviewAgencyUpgradeAction(
  userId: string,
  decision: "APPROVED" | "REJECTED"
): Promise<SettingsActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: "غير مصرّح." }
  }
  if (!isDatabaseConfigured()) return { error: "قاعدة البيانات غير مُعدّة." }

  const id = userId.trim()
  if (!id) return { error: "معرّف مفقود." }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return { error: "المستخدم غير موجود." }
  if (target.agencyUpgradeStatus !== "PENDING") {
    return { error: "لا يوجد طلب معلّق لهذا المستخدم." }
  }

  await prisma.user.update({
    where: { id },
    data:
      decision === "APPROVED"
        ? {
            agencyUpgradeStatus: "APPROVED",
            accountType: "AGENCY",
          }
        : {
            agencyUpgradeStatus: "REJECTED",
            accountType: "INDIVIDUAL",
          },
  })

  revalidatePath("/admin/users")
  revalidatePath("/dashboard/settings")
  revalidatePath("/agencies")
  return {
    success:
      decision === "APPROVED"
        ? "تمت ترقية الحساب إلى وكيل عقاري — تجاري."
        : "تم رفض طلب الترقية.",
  }
}

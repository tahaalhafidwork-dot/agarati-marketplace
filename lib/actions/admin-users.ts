"use server"

import { revalidatePath } from "next/cache"
import type { UserRole } from "@prisma/client"

import { requireAdmin } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { createServiceClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { ensureAgencyForApprovedOwner } from "@/lib/agency-service"

export type AdminUserActionState = {
  error?: string
  success?: string
}

/** Platform access plus AGENCY, which creates an OWNER membership. */
export type AdminAccountKind = UserRole | "AGENCY"

const ACCOUNT_KINDS: AdminAccountKind[] = [
  "SEEKER",
  "LISTER",
  "ADMIN",
  "AGENCY",
]

function resolveAccountKind(kind: AdminAccountKind): {
  role: UserRole
  accountType: "INDIVIDUAL" | "AGENCY"
  agencyUpgradeStatus: "NONE" | "APPROVED"
  seedOfficeName: boolean
} {
  if (kind === "AGENCY") {
    return {
      role: "LISTER",
      accountType: "AGENCY",
      agencyUpgradeStatus: "APPROVED",
      seedOfficeName: true,
    }
  }
  return {
    role: kind,
    accountType: "INDIVIDUAL",
    agencyUpgradeStatus: "NONE",
    seedOfficeName: false,
  }
}

export async function updateAdminUserCredentialsAction(
  _prev: AdminUserActionState,
  formData: FormData
): Promise<AdminUserActionState> {
  if (!isDatabaseConfigured() || !isSupabaseConfigured()) {
    return { error: "قاعدة البيانات أو Supabase غير مُعدّة." }
  }

  try {
    await requireAdmin()
  } catch {
    return { error: "غير مصرّح." }
  }

  const userId = String(formData.get("userId") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim() || null
  const kindRaw = String(formData.get("role") ?? "").trim() as AdminAccountKind

  if (!userId) return { error: "معرّف المستخدم مفقود." }
  if (!email || !email.includes("@")) return { error: "بريد غير صالح." }
  if (!name) return { error: "الاسم مطلوب." }
  if (password && password.length < 6) {
    return { error: "كلمة المرور 6 أحرف على الأقل." }
  }
  if (!ACCOUNT_KINDS.includes(kindRaw)) return { error: "دور غير صالح." }

  const existing = await prisma.user.findUnique({ where: { id: userId } })
  if (!existing) return { error: "المستخدم غير موجود." }

  const emailTaken = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
    select: { id: true },
  })
  if (emailTaken) return { error: "هذا البريد مستخدم لحساب آخر." }

  const resolved = resolveAccountKind(kindRaw)

  try {
    const admin = createServiceClient()
    const authUpdate: { email?: string; password?: string; user_metadata?: Record<string, string | null> } =
      {
        user_metadata: { name, phone },
      }
    if (email !== existing.email) authUpdate.email = email
    if (password) authUpdate.password = password

    const { error: authError } = await admin.auth.admin.updateUserById(
      userId,
      authUpdate
    )
    if (authError) return { error: authError.message }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "تعذر تحديث حساب الدخول"
    return { error: msg }
  }

  const officeName =
    resolved.seedOfficeName && !existing.agencyOfficeName?.trim()
      ? name
      : undefined

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        email,
        name,
        phone,
        whatsapp: phone,
        role: resolved.role,
        accountType: resolved.accountType,
        agencyUpgradeStatus: resolved.agencyUpgradeStatus,
        ...(officeName ? { agencyOfficeName: officeName } : {}),
      },
    })
    if (kindRaw === "AGENCY") {
      await ensureAgencyForApprovedOwner(userId, tx)
    } else {
      const owned = await tx.agencyMembership.findFirst({
        where: { userId, role: "OWNER", status: "ACTIVE" },
        select: { agencyId: true },
      })
      if (owned) {
        await tx.agency.update({
          where: { id: owned.agencyId },
          data: { status: "SUSPENDED" },
        })
        await tx.agencyMembership.updateMany({
          where: { agencyId: owned.agencyId, status: "ACTIVE" },
          data: { status: "LEFT", leftAt: new Date() },
        })
      }
    }
  })

  revalidatePath("/admin/users")
  revalidatePath("/admin")
  revalidatePath("/agencies")
  revalidatePath("/dashboard/settings")
  return {
    success:
      kindRaw === "AGENCY"
        ? "تم حفظ البيانات وتحويل الحساب إلى صاحب وكالة."
        : "تم حفظ بيانات الدخول.",
  }
}

export async function deleteAdminUserAction(
  userId: string
): Promise<AdminUserActionState> {
  if (!isDatabaseConfigured() || !isSupabaseConfigured()) {
    return { error: "قاعدة البيانات أو Supabase غير مُعدّة." }
  }

  let adminUser
  try {
    adminUser = await requireAdmin()
  } catch {
    return { error: "غير مصرّح." }
  }

  const id = userId.trim()
  if (!id) return { error: "معرّف المستخدم مفقود." }
  if (id === adminUser.id) {
    return { error: "لا يمكنك حذف حسابك الحالي." }
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  })
  if (!target) return { error: "المستخدم غير موجود." }

  if (target.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
    if (adminCount <= 1) {
      return { error: "لا يمكن حذف آخر مشرف في المنصة." }
    }
  }

  const ownsAgency = await prisma.agency.findFirst({
    where: { createdById: id },
    select: { name: true },
  })
  if (ownsAgency) {
    return {
      error: `لا يمكن حذف منشئ الوكالة (${ownsAgency.name}) قبل نقل ملكيتها أو أرشفتها إداريًا.`,
    }
  }

  try {
    const admin = createServiceClient()
    const { error: authError } = await admin.auth.admin.deleteUser(id)
    if (authError) return { error: authError.message }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "تعذر حذف حساب الدخول"
    return { error: msg }
  }

  await prisma.user.delete({ where: { id } })

  revalidatePath("/admin/users")
  revalidatePath("/admin")
  revalidatePath("/admin/properties")
  revalidatePath("/properties")
  revalidatePath("/")
  return { success: "تم حذف المستخدم." }
}

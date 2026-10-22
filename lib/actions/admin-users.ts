"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { createServiceClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { ensureAgencyForApprovedOwner } from "@/lib/agency-service"

export type AdminUserActionState = {
  error?: string
  success?: string
}

export type AdminAccountKind = "INDIVIDUAL" | "AGENCY"
export type AdminPlatformAccess = "USER" | "ADMIN"

const ACCOUNT_KINDS: AdminAccountKind[] = [
  "INDIVIDUAL",
  "AGENCY",
]
const PLATFORM_ACCESS: AdminPlatformAccess[] = ["USER", "ADMIN"]

function resolveAccountKind(
  kind: AdminAccountKind,
  platformAccess: AdminPlatformAccess,
  existingRole: "SEEKER" | "LISTER" | "ADMIN"
): {
  role: "SEEKER" | "LISTER" | "ADMIN"
  accountType: "INDIVIDUAL" | "AGENCY"
  agencyUpgradeStatus: "NONE" | "APPROVED"
  seedOfficeName: boolean
} {
  if (kind === "AGENCY") {
    return {
      role:
        platformAccess === "ADMIN"
          ? "ADMIN"
          : existingRole === "SEEKER"
            ? "SEEKER"
            : "LISTER",
      accountType: "AGENCY",
      agencyUpgradeStatus: "APPROVED",
      seedOfficeName: true,
    }
  }
  return {
    role:
      platformAccess === "ADMIN"
        ? "ADMIN"
        : existingRole === "SEEKER"
          ? "SEEKER"
          : "LISTER",
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
  const kindRaw = String(
    formData.get("accountKind") ?? ""
  ).trim() as AdminAccountKind
  const platformAccessRaw = String(
    formData.get("platformAccess") ?? "USER"
  ).trim() as AdminPlatformAccess

  if (!userId) return { error: "معرّف المستخدم مفقود." }
  if (!email || !email.includes("@")) return { error: "بريد غير صالح." }
  if (!name) return { error: "الاسم مطلوب." }
  if (password && password.length < 6) {
    return { error: "كلمة المرور 6 أحرف على الأقل." }
  }
  if (!ACCOUNT_KINDS.includes(kindRaw)) return { error: "نوع حساب غير صالح." }
  if (!PLATFORM_ACCESS.includes(platformAccessRaw)) {
    return { error: "صلاحية نظام غير صالحة." }
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } })
  if (!existing) return { error: "المستخدم غير موجود." }

  if (existing.role === "ADMIN" && platformAccessRaw === "USER") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
    if (adminCount <= 1) {
      return { error: "لا يمكن إزالة صلاحية آخر مدير في النظام." }
    }
  }

  const activeAgentMembership = await prisma.agencyMembership.findFirst({
    where: { userId, status: "ACTIVE", role: "AGENT" },
    select: { agency: { select: { name: true } } },
  })
  if (kindRaw === "AGENCY" && activeAgentMembership) {
    return {
      error: `الحساب وكيل نشط لدى «${activeAgentMembership.agency.name}». يجب إنهاء العضوية أولًا قبل تحويله إلى وكالة تجارية.`,
    }
  }

  const emailTaken = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
    select: { id: true },
  })
  if (emailTaken) return { error: "هذا البريد مستخدم لحساب آخر." }

  const resolved = resolveAccountKind(kindRaw, platformAccessRaw, existing.role)

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

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`agency-user:${userId}`}, 0))`
      if (existing.role === "ADMIN" && platformAccessRaw === "USER") {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended('platform-admins', 0))`
        const adminCount = await tx.user.count({ where: { role: "ADMIN" } })
        if (adminCount <= 1) throw new Error("LAST_ADMIN_REQUIRED")
      }
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
  } catch (error) {
    if (error instanceof Error && error.message === "LAST_ADMIN_REQUIRED") {
      return { error: "لا يمكن إزالة صلاحية آخر مدير في النظام." }
    }
    if (error instanceof Error && error.message === "AGENCY_AGENT_CANNOT_OWN") {
      return {
        error: "لا يمكن تحويل وكيل نشط إلى وكالة تجارية قبل إنهاء عضويته الحالية.",
      }
    }
    return { error: "تعذّر حفظ نوع الحساب." }
  }

  revalidatePath("/admin/users")
  revalidatePath("/admin")
  revalidatePath("/agencies")
  revalidatePath("/dashboard/settings")
  return {
    success:
      kindRaw === "AGENCY"
        ? "تم حفظ البيانات وتحويل الحساب إلى وكالة تجارية."
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

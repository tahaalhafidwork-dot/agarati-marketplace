import type { Metadata } from "next"
import { redirect } from "next/navigation"

import {
  AccountTypePanel,
  DangerZone,
  NotificationToggles,
  ProfileForm,
  SecurityForm,
  SessionsPanel,
  SettingsProfileCard,
} from "@/components/settings"
import { getActiveAgencyMembership } from "@/lib/agency-service"
import { getSessionUser } from "@/lib/auth"
import { isDatabaseConfigured } from "@/lib/db"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"

export const metadata: Metadata = {
  title: "الإعدادات",
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ agency?: string; focus?: string }>
}) {
  const user = await getSessionUser()
  if (!user) {
    redirect("/login?next=/dashboard/settings")
  }

  const params = await searchParams
  const highlightPending = params.agency === "pending"
  const focusAccountType = params.focus === "account-type"

  let agencyMembership: Awaited<
    ReturnType<typeof getActiveAgencyMembership>
  > = null
  if (isDatabaseConfigured()) {
    try {
      agencyMembership = await getActiveAgencyMembership(user.id)
    } catch {
      agencyMembership = null
    }
  }

  let lastSignInAt: string | null = null
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      lastSignInAt =
        (authUser?.last_sign_in_at as string | undefined) ??
        authUser?.created_at ??
        null
    } catch {
      lastSignInAt = null
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 pb-10">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[#0F2744]">
          الإعدادات
        </h1>
        <p className="text-sm text-muted-foreground">
          إدارة ملفك، الأمان، الإشعارات، ونوع الحساب من مكان واحد.
        </p>
      </div>

      {highlightPending && user.agencyUpgradeStatus === "PENDING" ? (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">تم إنشاء حسابك — طلب تحويله إلى وكالة قيد المراجعة</p>
          <p className="mt-1 text-xs leading-5 text-amber-950/85">
            يمكنك استخدام المنصة كحساب فردي الآن. عند الموافقة يتحول إلى وكالة
            تجارية وتُفعّل لوحة الوكالة.
          </p>
        </div>
      ) : null}

      <SettingsProfileCard
        user={user}
        agencyMembership={
          agencyMembership ? { role: agencyMembership.role } : null
        }
      />
      <ProfileForm user={user} />
      <SecurityForm user={user} />
      <NotificationToggles user={user} />
      <AccountTypePanel
        user={user}
        agencyMembership={
          agencyMembership
            ? {
                role: agencyMembership.role,
                agencyName: agencyMembership.agency.name,
              }
            : null
        }
        highlightPending={highlightPending}
        scrollIntoView={focusAccountType}
      />
      <SessionsPanel user={user} lastSignInAt={lastSignInAt} />
      <DangerZone />
    </div>
  )
}

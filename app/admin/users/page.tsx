import type { Metadata } from "next"

import { AdminUsersList } from "@/components/admin/admin-users-list"
import {
  ensureBootstrapAdmin,
  fetchAdminUsers,
} from "@/lib/admin-service"
import { isDatabaseConfigured } from "@/lib/db"

export const metadata: Metadata = {
  title: "المستخدمون",
}

export default async function AdminUsersPage() {
  const session = await ensureBootstrapAdmin()

  if (!session) {
    return (
      <p className="text-sm text-destructive">
        يجب تسجيل الدخول لعرض المستخدمين.
      </p>
    )
  }

  if (session.role !== "ADMIN") {
    return (
      <p className="text-sm text-destructive">
        هذه الصفحة للمسؤولين فقط. لا يوجد لديك دور ADMIN بعد.
      </p>
    )
  }

  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        قاعدة البيانات غير مُعدّة — docs/SUPABASE_SETUP.md
      </p>
    )
  }

  const users = await fetchAdminUsers()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#0F2744]">المستخدمون</h1>
        <p className="text-sm text-muted-foreground">
          بحث، تعديل رموز الدخول، أو حذف الحسابات
        </p>
      </div>

      <AdminUsersList
        currentUserId={session.id}
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          whatsapp: u.whatsapp,
          role: u.role,
          createdAt: u.createdAt.toISOString(),
          listingsCount: u._count.listings,
          favoritesCount: u._count.favorites,
          accountType: u.accountType,
          agencyUpgradeStatus: u.agencyUpgradeStatus,
          agencyOfficeName: u.agencyOfficeName,
          agencyLogoUrl: u.agencyLogoUrl,
          agencySocialUrl: u.agencySocialUrl,
          agencyAddressLine: u.agencyAddressLine,
          agencyCitySlug: u.agencyCitySlug,
          agencyDistrictSlug: u.agencyDistrictSlug,
          agencyNeighborhoodSlug: u.agencyNeighborhoodSlug,
          agencyRequestNote: u.agencyRequestNote,
          agencyMembership: u.agencyMemberships[0] ?? null,
        }))}
      />
    </div>
  )
}

import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AgencyProjectsManager } from "@/components/dashboard/agency-projects-manager"
import { getActiveAgencyMembership } from "@/lib/agency-service"
import { getSessionUser } from "@/lib/auth"
import {
  listAgencyProjectsForUser,
  listPendingProposalsForUser,
  listProjects,
} from "@/lib/agency-directory"
import { isDatabaseConfigured } from "@/lib/db"

export const metadata: Metadata = {
  title: "مشاريع مكتبك",
}

export default async function AgencyProjectsPage() {
  const user = await getSessionUser()
  if (!user) redirect("/login?next=/dashboard/agency-projects")

  const membership = isDatabaseConfigured()
    ? await getActiveAgencyMembership(user.id)
    : null
  if (!membership || membership.role !== "OWNER") redirect("/dashboard")

  const linked = isDatabaseConfigured()
    ? await listAgencyProjectsForUser(user.id)
    : []
  const catalog = isDatabaseConfigured() ? await listProjects(undefined, 100) : []
  const pending = isDatabaseConfigured()
    ? await listPendingProposalsForUser(user.id)
    : []

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-[#0F2744]">
          مشاريع مكتبك العقاري
        </h1>
        <div className="space-y-1.5 text-sm leading-6 text-muted-foreground">
          <p>
            اربط مكتبك بالمشاريع السكنية التي تسوّقها. هكذا يظهر مكتبك للباحثين
            عن وحدات داخل المشروع، ويصبح الوصول إليك أوضح من صفحة المشروع وصفحة
            مكتبك.
          </p>
          <p className="text-[0.8rem]">
            إن كان المشروع معتمداً في الموقع: اربطه فوراً. إن لم يظهر في القائمة:
            أضفه بالاسم فقط — وتكمل الإدارة التفاصيل لاحقاً.
          </p>
        </div>
      </div>
      {!isDatabaseConfigured() ? (
        <p className="text-sm text-muted-foreground">قاعدة البيانات غير مُعدّة.</p>
      ) : (
        <AgencyProjectsManager
          linked={linked.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            status: p.status,
            imageUrl: p.imageUrl,
          }))}
          catalog={catalog.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            imageUrl: p.imageUrl,
          }))}
          pending={pending.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
          }))}
        />
      )}
    </div>
  )
}

import type { Metadata } from "next"

import { AdminProjectCreateForm } from "@/components/admin/admin-project-create-form"
import { AdminProjectPhotosReviewList } from "@/components/admin/admin-project-photos-review-list"
import { AdminProjectsManageList } from "@/components/admin/admin-projects-manage-list"
import { AdminProjectsReviewList } from "@/components/admin/admin-projects-review-list"
import { ensureBootstrapAdmin } from "@/lib/admin-service"
import {
  listManagedProjects,
  listPendingProjectPhotos,
  listPendingProjects,
} from "@/lib/agency-directory"
import { isDatabaseConfigured } from "@/lib/db"

export const metadata: Metadata = {
  title: "مراجعة المشاريع",
}

export default async function AdminProjectsPage() {
  const session = await ensureBootstrapAdmin()
  if (!session || session.role !== "ADMIN") {
    return (
      <p className="text-sm text-destructive">هذه الصفحة للمسؤولين فقط.</p>
    )
  }
  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">قاعدة البيانات غير مُعدّة.</p>
    )
  }

  const [pending, pendingPhotos, managed] = await Promise.all([
    listPendingProjects(80),
    listPendingProjectPhotos(80),
    listManagedProjects(120),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">إدارة المشاريع</h1>
        <p className="text-sm text-muted-foreground">
          إنشاء وتعديل وأرشفة المشاريع، مراجعة الاقتراحات وصور المساهمين، وتعيين
          مركز المبيعات الرسمي.
        </p>
      </div>

      <AdminProjectCreateForm />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#0F2744]">
          المشاريع ({managed.length})
        </h2>
        <AdminProjectsManageList
          projects={managed.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            summary: p.summary,
            imageUrl: p.imageUrl,
            status: p.status,
            projectKind: p.projectKind,
            citySlug: p.citySlug,
            districtSlug: p.districtSlug,
            neighborhoodSlug: p.neighborhoodSlug,
            websiteUrl: p.websiteUrl,
            photoCount: p._count.photos,
            agencies: p.agencies.map((a) => ({
              userId: a.userId,
              isOfficialSalesDesk: a.isOfficialSalesDesk,
              officeName: a.user.agencyOfficeName ?? "",
              userName: a.user.name,
            })),
          }))}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#0F2744]">
          اقتراحات مشاريع ({pending.length})
        </h2>
        <AdminProjectsReviewList
          projects={pending.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            summary: p.summary,
            imageUrl: p.imageUrl,
            createdAt: p.createdAt.toISOString(),
            proposerName: p.createdBy?.name ?? "—",
            proposerOffice: p.createdBy?.agencyOfficeName ?? null,
          }))}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#0F2744]">
          صور المعرض ({pendingPhotos.length})
        </h2>
        <p className="text-xs text-muted-foreground">
          مشاركات المستخدمين — تظهر في `/projects/[slug]` بعد القبول (حد أقصى ٣٠
          صورة موافَق عليها لكل مشروع).
        </p>
        <AdminProjectPhotosReviewList
          photos={pendingPhotos.map((p) => ({
            id: p.id,
            storagePath: p.storagePath,
            contributorName: p.contributorName,
            createdAt: p.createdAt.toISOString(),
            projectName: p.project.name,
            projectSlug: p.project.slug,
          }))}
        />
      </section>
    </div>
  )
}

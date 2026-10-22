"use client"

import { useActionState, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Archive, Check, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  adminArchiveProjectAction,
  adminDeleteProjectAction,
  adminRestoreProjectAction,
  adminUpdateProjectAction,
  adminUpdateProjectCoverAction,
  clearOfficialSalesDeskAction,
  setOfficialSalesDeskAction,
  type AdminProjectActionState,
} from "@/lib/actions/admin-projects"
import { AdminProjectLocationFields } from "@/components/admin/admin-project-location-fields"
import { projectKindLabelAr } from "@/lib/project-kinds"

const initial: AdminProjectActionState = {}

type AgencyLink = {
  userId: string
  isOfficialSalesDesk: boolean
  officeName: string
  userName: string
}

type ManagedProject = {
  id: string
  slug: string
  name: string
  summary: string | null
  imageUrl: string | null
  status: string
  projectKind: "RESIDENTIAL" | "MIXED_USE" | "COMMERCIAL"
  citySlug: string | null
  districtSlug: string | null
  neighborhoodSlug: string | null
  websiteUrl: string | null
  agencies: AgencyLink[]
  photoCount: number
}

export function AdminProjectsManageList({
  projects,
}: {
  projects: ManagedProject[]
}) {
  if (projects.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
        لا مشاريع معتمدة/مؤرشفة بعد.
      </p>
    )
  }

  return (
    <ul className="space-y-4">
      {projects.map((p) => (
        <AdminProjectManageCard key={p.id} project={p} />
      ))}
    </ul>
  )
}

function AdminProjectManageCard({ project }: { project: ManagedProject }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, startTransition] = useTransition()
  const [updateState, updateAction, updatePending] = useActionState(
    adminUpdateProjectAction,
    initial
  )
  const [coverState, coverAction, coverPending] = useActionState(
    adminUpdateProjectCoverAction,
    initial
  )

  function run(
    fn: () => Promise<AdminProjectActionState>
  ) {
    setMessage(null)
    startTransition(async () => {
      const r = await fn()
      setMessage(r.error ?? r.success ?? null)
      if (!r.error) router.refresh()
    })
  }

  return (
    <li className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          {project.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.imageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-[0.6rem] text-muted-foreground">
              بلا غلاف
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-[#0F2744]">{project.name}</p>
            <span className="rounded bg-muted px-1.5 py-px text-[0.6rem]">
              {projectKindLabelAr(project.projectKind)}
            </span>
            <span className="rounded bg-muted px-1.5 py-px text-[0.6rem]">
              {project.status}
            </span>
          </div>
          <p className="text-[0.7rem] text-muted-foreground" dir="ltr">
            {project.slug}
          </p>
          {project.summary ? (
            <p className="line-clamp-2 text-xs text-[#0F2744]/85">
              {project.summary}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "إخفاء التعديل" : "تعديل"}
            </Button>
            {project.status === "ARCHIVED" ? (
              <Button
                type="button"
                size="sm"
                disabled={busy}
                onClick={() => run(() => adminRestoreProjectAction(project.id))}
              >
                <Check className="size-3.5" />
                استعادة
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => run(() => adminArchiveProjectAction(project.id))}
              >
                <Archive className="size-3.5" />
                أرشفة
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-destructive"
              disabled={busy}
              onClick={() => run(() => adminDeleteProjectAction(project.id))}
            >
              <Trash2 className="size-3.5" />
              حذف
            </Button>
          </div>
          {message ? (
            <p className="text-xs text-muted-foreground">{message}</p>
          ) : null}
        </div>
      </div>

      {open ? (
        <div className="space-y-4 border-t border-border bg-[#faf6ef]/40 p-3">
          <form action={updateAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="projectId" value={project.id} />
            <div className="space-y-1.5 sm:col-span-2">
              <Label>الاسم</Label>
              <Input name="name" defaultValue={project.name} required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>النبذة</Label>
              <textarea
                name="summary"
                rows={2}
                defaultValue={project.summary ?? ""}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label>النوع</Label>
              <select
                name="projectKind"
                defaultValue={project.projectKind}
                className="h-10 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
              >
                <option value="RESIDENTIAL">سكني</option>
                <option value="MIXED_USE">سكني تجاري</option>
                <option value="COMMERCIAL">تجاري</option>
              </select>
            </div>
            <AdminProjectLocationFields
              idPrefix={`edit-${project.id}`}
              initialCitySlug={project.citySlug}
              initialDistrictSlug={project.districtSlug}
              initialNeighborhoodSlug={project.neighborhoodSlug}
              initialWebsiteUrl={project.websiteUrl}
            />
            {updateState.error ? (
              <p className="text-xs text-destructive sm:col-span-2">
                {updateState.error}
              </p>
            ) : null}
            {updateState.success ? (
              <p className="text-xs text-emerald-700 sm:col-span-2">
                {updateState.success}
              </p>
            ) : null}
            <Button
              type="submit"
              size="sm"
              disabled={updatePending}
              className="sm:col-span-2"
            >
              {updatePending ? "جاري…" : "حفظ التعديلات"}
            </Button>
          </form>

          <form action={coverAction} className="space-y-2">
            <input type="hidden" name="projectId" value={project.id} />
            <Label>تغيير الغلاف</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                name="image"
                type="file"
                accept="image/*"
                required
                className="max-w-xs cursor-pointer file:me-2 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
              />
              <Button type="submit" size="sm" disabled={coverPending}>
                {coverPending ? "جاري…" : "رفع الغلاف"}
              </Button>
            </div>
            {coverState.error ? (
              <p className="text-xs text-destructive">{coverState.error}</p>
            ) : null}
            {coverState.success ? (
              <p className="text-xs text-emerald-700">{coverState.success}</p>
            ) : null}
          </form>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#0F2744]">
              وكالات مربوطة · مركز مبيعات رسمي (واحد)
            </p>
            {project.agencies.length === 0 ? (
              <p className="text-[0.7rem] text-muted-foreground">
                لا وكالات مربوطة.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {project.agencies.map((a) => (
                  <li
                    key={a.userId}
                    className="flex items-center justify-between gap-2 px-2.5 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      {a.officeName || a.userName}
                      {a.isOfficialSalesDesk ? (
                        <span className="ms-1 text-[0.65rem] text-emerald-700">
                          · رسمي
                        </span>
                      ) : null}
                    </span>
                    {a.isOfficialSalesDesk ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          run(() => clearOfficialSalesDeskAction(project.id))
                        }
                      >
                        إلغاء الرسمي
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          run(() =>
                            setOfficialSalesDeskAction(project.id, a.userId)
                          )
                        }
                      >
                        تعيين رسمي
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </li>
  )
}

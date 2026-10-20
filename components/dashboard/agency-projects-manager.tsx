"use client"

import { useActionState } from "react"
import { Clock3, Link2, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  attachAgencyProjectAction,
  detachAgencyProjectAction,
  proposeProjectAction,
  type AgencyProjectActionState,
} from "@/lib/actions/agency-projects"

const initial: AgencyProjectActionState = {}

type ProjectOpt = {
  id: string
  slug: string
  name: string
  status?: string
  imageUrl?: string | null
}

export function AgencyProjectsManager({
  linked,
  catalog,
  pending,
}: {
  linked: ProjectOpt[]
  catalog: ProjectOpt[]
  pending: ProjectOpt[]
}) {
  const [attachState, attachAction, attachPending] = useActionState(
    attachAgencyProjectAction,
    initial
  )
  const [proposeState, proposeAction, proposePending] = useActionState(
    proposeProjectAction,
    initial
  )
  const [detachState, detachAction, detachPending] = useActionState(
    detachAgencyProjectAction,
    initial
  )

  const linkedIds = new Set(linked.map((p) => p.id))
  const available = catalog.filter((p) => !linkedIds.has(p.id))

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-[#0F2744]">
            مشاريع مكتبك
          </h2>
          <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
            تظهر على صفحة مكتبك العامة وتساعد الباحثين على الوصول إليك عند تصفح
            المشروع.
          </p>
        </div>
        {linked.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/20 px-3 py-8 text-center text-sm text-muted-foreground">
            لم تربط أي مشروع بعد.
            <br />
            <span className="text-[0.75rem]">
              اربط مشروعاً من القائمة أدناه، أو أضفه إن لم يكن مدرجاً.
            </span>
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {linked.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="size-10 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-[0.6rem] text-muted-foreground">
                      مشروع
                    </div>
                  )}
                  <p className="truncate text-sm font-medium text-[#0F2744]">
                    {p.name}
                  </p>
                </div>
                <form action={detachAction}>
                  <input type="hidden" name="projectId" value={p.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive"
                    disabled={detachPending}
                  >
                    <Trash2 className="size-3.5" />
                    إزالة
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
        {detachState.error ? (
          <p className="text-xs text-destructive">{detachState.error}</p>
        ) : null}
        {detachState.success ? (
          <p className="text-xs text-emerald-700">{detachState.success}</p>
        ) : null}
      </section>

      {pending.length > 0 ? (
        <section className="space-y-2 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3">
          <h2 className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-950">
            <Clock3 className="size-4" />
            بانتظار موافقة الإدارة
          </h2>
          <p className="text-[0.7rem] text-amber-950/75">
            بعد الموافقة يُضاف المشروع للدليل ويُربط بمكتبك تلقائياً.
          </p>
          <ul className="space-y-1">
            {pending.map((p) => (
              <li key={p.id} className="text-sm font-medium text-amber-950">
                {p.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3 rounded-xl border border-border bg-[#faf6ef]/50 p-3.5">
        <div>
          <h2 className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F2744]">
            <Link2 className="size-4 text-[color:var(--brand-gold)]" />
            ربط بمشروع موجود
          </h2>
          <p className="mt-1 text-[0.75rem] leading-5 text-muted-foreground">
            اختر مشروعاً معتمداً من القائمة ليظهر مكتبك كجهة تسويق له — الربط
            فوري دون انتظار.
          </p>
        </div>
        <form action={attachAction} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="projectId">المشروع</Label>
            <select
              id="projectId"
              name="projectId"
              required
              className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              defaultValue=""
            >
              <option value="" disabled>
                {available.length === 0
                  ? "لا مشاريع متاحة للربط حالياً"
                  : "اختر مشروعاً…"}
              </option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <p className="rounded-lg border border-dashed border-border/80 bg-card/80 px-2.5 py-2 text-[0.75rem] leading-5 text-[#0F2744]/85">
            المشروع غير مدرج أو غير ظاهر في القائمة؟ يمكنك{" "}
            <a
              href="#propose-project"
              className="font-semibold text-[color:var(--brand-gold)] underline-offset-2 hover:underline"
            >
              إضافته من هنا
            </a>
            {" — "}
            يكفي الاسم وصورة اختيارية، وتكمل الإدارة التفاصيل لاحقاً.
          </p>
          {attachState.error ? (
            <p className="text-xs text-destructive">{attachState.error}</p>
          ) : null}
          {attachState.success ? (
            <p className="text-xs text-emerald-700">{attachState.success}</p>
          ) : null}
          <Button
            type="submit"
            size="sm"
            disabled={attachPending || available.length === 0}
          >
            {attachPending ? "جاري…" : "ربط المشروع بمكتبي"}
          </Button>
        </form>
      </section>

      <section
        id="propose-project"
        className="scroll-mt-24 space-y-3 rounded-xl border border-border p-3.5"
      >
        <div>
          <h2 className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F2744]">
            <Plus className="size-4 text-[color:var(--brand-gold)]" />
            إضافة مشروع غير مدرج
          </h2>
          <p className="mt-1 text-[0.75rem] leading-5 text-muted-foreground">
            أدخل اسم المشروع فقط. الإدارة تضيف الموقع والنبذة والصور وباقي
            التفاصيل بعد المراجعة.
          </p>
        </div>
        <form action={proposeAction} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="projectName">اسم المشروع *</Label>
            <Input
              id="projectName"
              name="projectName"
              required
              minLength={2}
              placeholder="مثال: فلوريا سيتي"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="projectImage">صورة الغلاف (اختياري)</Label>
            <Input
              id="projectImage"
              name="projectImage"
              type="file"
              accept="image/*"
              className="cursor-pointer file:me-3 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
            />
            <p className="text-[0.65rem] text-muted-foreground">
              صورة توضيحية تساعد الإدارة في التعرف على المشروع — ليست إلزامية.
            </p>
          </div>
          {proposeState.error ? (
            <p className="text-xs text-destructive">{proposeState.error}</p>
          ) : null}
          {proposeState.success ? (
            <p className="text-xs text-emerald-700">{proposeState.success}</p>
          ) : null}
          <Button type="submit" size="sm" disabled={proposePending}>
            {proposePending ? "جاري…" : "إرسال للمراجعة"}
          </Button>
        </form>
      </section>
    </div>
  )
}

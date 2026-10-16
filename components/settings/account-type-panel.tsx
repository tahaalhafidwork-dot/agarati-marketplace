"use client"

import { useActionState, useEffect, useRef } from "react"
import Link from "next/link"
import { Building2, CheckCircle2, Clock3, Send } from "lucide-react"

import { SettingsSection } from "@/components/settings/settings-section"
import { AgencyLocationFields } from "@/components/agency/agency-location-fields"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  requestAgencyUpgradeAction,
  type SettingsActionState,
} from "@/lib/actions/settings"
import type { SessionUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

const initial: SettingsActionState = {}

export function AccountTypePanel({
  user,
  highlightPending,
  scrollIntoView,
}: {
  user: SessionUser
  highlightPending?: boolean
  /** Scroll this section into view (e.g. from mobile nav CTA). */
  scrollIntoView?: boolean
}) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [state, action, pending] = useActionState(
    requestAgencyUpgradeAction,
    initial
  )

  const isAgency =
    user.accountType === "AGENCY" || user.agencyUpgradeStatus === "APPROVED"
  const isPending = user.agencyUpgradeStatus === "PENDING"
  const isRejected = user.agencyUpgradeStatus === "REJECTED"
  const fromSignup =
    user.agencyRequestNote?.includes("طلب عند التسجيل") ?? false

  useEffect(() => {
    if (!scrollIntoView) return
    const el = sectionRef.current
    if (!el) return
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 80)
    return () => window.clearTimeout(t)
  }, [scrollIntoView])

  return (
    <div ref={sectionRef} className="scroll-mt-20">
      <SettingsSection
        id="account-type"
        title="نوع الحساب"
        description="اطّلع على نوع حسابك واطلب الترقية إلى وكيل عقاري — تجاري بعد مراجعة الإدارة."
        className={cn(
          highlightPending && isPending
            ? "ring-2 ring-[color:var(--brand-gold)]/35"
            : null,
          scrollIntoView ? "ring-2 ring-[color:var(--brand-gold)]/40" : null
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-md bg-[#0F2744]/8 text-[#0F2744]">
            {isAgency ? "وكيل عقاري — تجاري" : "حساب فردي"}
          </Badge>
          {isPending ? (
            <Badge variant="outline" className="gap-1 rounded-md text-[0.65rem]">
              <Clock3 className="size-3" />
              طلب قيد المراجعة
            </Badge>
          ) : null}
          {isPending && fromSignup ? (
            <Badge variant="outline" className="rounded-md text-[0.65rem]">
              من التسجيل
            </Badge>
          ) : null}
          {isRejected ? (
            <Badge
              variant="outline"
              className="rounded-md text-[0.65rem] text-destructive"
            >
              رُفض الطلب السابق — يمكن إعادة التقديم
            </Badge>
          ) : null}
        </div>

        {isAgency ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-lg border border-[color:var(--brand-gold)]/30 bg-[color:var(--brand-gold)]/10 px-3 py-3 text-sm text-[#0F2744]">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-gold)]" />
              <div className="min-w-0 space-y-1">
                <p>
                  حسابك مفعّل كوكيل عقاري — تجاري
                  {user.agencyOfficeName ? ` · ${user.agencyOfficeName}` : ""}.
                </p>
                {user.agencySocialUrl ? (
                  <a
                    href={user.agencySocialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-xs text-primary underline-offset-2 hover:underline"
                    dir="ltr"
                  >
                    {user.agencySocialUrl}
                  </a>
                ) : null}
              </div>
            </div>
            <Link
              href="/dashboard/agency-projects"
              className="inline-flex text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              إدارة المشاريع السكنية
            </Link>
          </div>
        ) : isPending ? (
          <div className="space-y-2 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-3 text-sm text-amber-950">
            <p className="inline-flex items-center gap-1.5 font-medium">
              <Clock3 className="size-4 shrink-0" />
              طلب الوكالة قيد المراجعة
            </p>
            <p className="text-xs leading-5 text-amber-950/85">
              {fromSignup
                ? "أرسلت طلب الوكالة أثناء إنشاء الحساب"
                : "أرسلت طلب الترقية من الإعدادات"}
              {user.agencyOfficeName
                ? ` باسم المكتب «${user.agencyOfficeName}»`
                : ""}
              . لن تحتاج لإعادة الإرسال حتى تكتمل مراجعة الإدارة.
            </p>
            {user.agencyLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.agencyLogoUrl}
                alt=""
                className="size-12 rounded-md border border-amber-200/80 object-cover"
              />
            ) : null}
          </div>
        ) : (
          <form
            action={action}
            className="space-y-3 rounded-lg border border-border bg-[#faf6ef]/40 p-3"
          >
            <div className="flex items-start gap-2 text-sm text-[#0F2744]">
              <Building2 className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-gold)]" />
              <p className="leading-6">
                الترقية تتيح حضوراً أوضح للمكاتب التجارية بعد موافقة الإدارة —
                وليست تفعيلاً فورياً. يمكنك أيضاً اختيار «وكالة تجارية» مباشرة عند
                إنشاء حساب جديد.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="officeName">اسم المكتب (اختياري)</Label>
              <Input
                id="officeName"
                name="officeName"
                placeholder="مثال: مكتب النخيل العقاري"
                defaultValue={user.agencyOfficeName ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agencyLogo">
                شعار المكتب <span className="text-destructive">*</span>
              </Label>
              <Input
                id="agencyLogo"
                name="agencyLogo"
                type="file"
                accept="image/*"
                required
                className="cursor-pointer file:me-3 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
              />
              <p className="text-[0.7rem] text-muted-foreground">
                صورة مربّعة واضحة — حتى ٣ ميغابايت
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agencySocialUrl">
                رابط تواصل اجتماعي (اختياري)
              </Label>
              <Input
                id="agencySocialUrl"
                name="agencySocialUrl"
                type="url"
                inputMode="url"
                placeholder="https://instagram.com/…"
                dir="ltr"
                className="text-start"
                defaultValue={user.agencySocialUrl ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label>موقع المكتب</Label>
              <AgencyLocationFields
                required
                defaultCity={user.agencyCitySlug}
                defaultDistrict={user.agencyDistrictSlug}
                defaultNeighborhood={user.agencyNeighborhoodSlug}
                defaultAddressLine={user.agencyAddressLine}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agencyBio">نبذة عامة (اختياري)</Label>
              <textarea
                id="agencyBio"
                name="agencyBio"
                rows={2}
                defaultValue={user.agencyBio ?? ""}
                placeholder="تعريف بالمكتب يظهر في صفحة الوكالة…"
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">ملاحظة للإدارة (اختياري)</Label>
              <textarea
                id="note"
                name="note"
                rows={3}
                defaultValue={
                  user.agencyRequestNote?.includes("طلب عند التسجيل")
                    ? ""
                    : (user.agencyRequestNote ?? "")
                }
                placeholder="منطقة العمل، عدد الوسطاء، أو أي معلومة تساعد المراجعة…"
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            {state.error ? (
              <p className="text-xs text-destructive">{state.error}</p>
            ) : null}
            {state.success ? (
              <p className="text-xs text-emerald-700">{state.success}</p>
            ) : null}
            <Button type="submit" size="sm" className="gap-1.5" disabled={pending}>
              <Send className="size-3.5" />
              {pending ? "جاري الإرسال…" : "طلب الترقية"}
            </Button>
          </form>
        )}
      </SettingsSection>
    </div>
  )
}

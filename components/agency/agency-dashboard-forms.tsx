"use client"

import { useActionState, useState } from "react"
import {
  CheckCircle2,
  Copy,
  Scale,
  SlidersHorizontal,
  UserPlus,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  inviteAgencyAgentAction,
  requestAgencySubscriptionAction,
  updateAgencyProfileAction,
  updateAgencyQuotasAction,
  type AgencyActionState,
} from "@/lib/actions/agency"

const initialState: AgencyActionState = {}

function Feedback({ state }: { state: AgencyActionState }) {
  if (!state.error && !state.success) return null
  const failed = Boolean(state.error)
  const Icon = failed ? XCircle : CheckCircle2

  return (
    <div
      role={failed ? "alert" : "status"}
      aria-live="polite"
      className={
        failed
          ? "flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
          : "flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800"
      }
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{state.error ?? state.success}</span>
    </div>
  )
}

export function InviteAgentForm() {
  const [state, action, pending] = useActionState(
    inviteAgencyAgentAction,
    initialState
  )
  return (
    <form action={action} className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div>
        <h2 className="font-semibold text-[#0F2744]">دعوة وكيل</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          يمكن دعوة مستخدم موجود أو بريد جديد. صلاحية الرابط 7 أيام.
        </p>
      </div>
      <label className="block space-y-1.5 text-sm">
        <span>البريد الإلكتروني</span>
        <Input name="email" type="email" required dir="ltr" />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span>الحصة اليدوية عند التفعيل</span>
        <Input name="manualQuota" type="number" min={0} max={30} defaultValue={0} />
      </label>
      <Feedback state={state} />
      {state.invitationUrl ? (
        <div className="flex items-center gap-2 rounded-lg bg-muted p-2" dir="ltr">
          <code className="min-w-0 flex-1 truncate text-xs">{state.invitationUrl}</code>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={() => navigator.clipboard.writeText(`${location.origin}${state.invitationUrl}`)}
            aria-label="نسخ الرابط"
          >
            <Copy className="size-3.5" />
          </Button>
        </div>
      ) : null}
      <Button type="submit" disabled={pending} className="gap-2">
        <UserPlus className="size-4" />
        {pending ? "جارٍ إنشاء الدعوة…" : "إنشاء الدعوة"}
      </Button>
    </form>
  )
}

export function AgencyQuotaForm({
  mode,
  members,
}: {
  mode: "EQUAL" | "MANUAL"
  members: Array<{
    userId: string
    name: string
    role: "OWNER" | "AGENT"
    used: number
    quota: number
  }>
}) {
  const [state, action, pending] = useActionState(
    updateAgencyQuotasAction,
    initialState
  )
  const [selectedMode, setSelectedMode] = useState(mode)

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div>
        <h2 className="font-semibold text-[#0F2744]">توزيع 30 إعلانًا</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          التوزيع المتساوي يعالج الباقي بترتيب العضوية؛ اليدوي لا يسمح بتجاوز 30.
        </p>
      </div>
      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="sr-only">طريقة توزيع الحصص</legend>
        <label className="cursor-pointer">
          <input
            className="peer sr-only"
            type="radio"
            name="mode"
            value="EQUAL"
            checked={selectedMode === "EQUAL"}
            onChange={() => setSelectedMode("EQUAL")}
          />
          <span className="flex min-h-20 items-start gap-3 rounded-xl border border-border bg-background p-3 transition peer-checked:border-[#B8956C] peer-checked:bg-[#fffaf3] peer-checked:ring-2 peer-checked:ring-[#B8956C]/15">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0F2744]/8 text-[#0F2744]">
              <Scale className="size-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-[#0F2744]">توزيع متساوٍ</span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">يوزّع النظام 30 إعلانًا تلقائيًا على الأعضاء.</span>
            </span>
          </span>
        </label>
        <label className="cursor-pointer">
          <input
            className="peer sr-only"
            type="radio"
            name="mode"
            value="MANUAL"
            checked={selectedMode === "MANUAL"}
            onChange={() => setSelectedMode("MANUAL")}
          />
          <span className="flex min-h-20 items-start gap-3 rounded-xl border border-border bg-background p-3 transition peer-checked:border-[#B8956C] peer-checked:bg-[#fffaf3] peer-checked:ring-2 peer-checked:ring-[#B8956C]/15">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#B8956C]/15 text-[#806446]">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-[#0F2744]">توزيع يدوي</span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">حدّد حصة كل عضو بما يناسب عمل الوكالة.</span>
            </span>
          </span>
        </label>
      </fieldset>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {members.map((member) => (
          <div key={member.userId} className="flex items-center gap-3 px-3 py-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0F2744] text-xs font-semibold text-white">
              {member.name.trim().slice(0, 1) || "؟"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#0F2744]">{member.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {member.role === "OWNER" ? "صاحب الوكالة" : "وكيل"} · مستخدم {member.used}
              </p>
            </div>
            {selectedMode === "MANUAL" ? (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>الحصة</span>
                <Input
                  name={`quota:${member.userId}`}
                  type="number"
                  min={0}
                  max={30}
                  defaultValue={member.quota}
                  className="w-16 text-center tabular-nums"
                  aria-label={`حصة ${member.name}`}
                />
              </label>
            ) : (
              <span className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-semibold tabular-nums text-[#0F2744]">
                {member.quota} إعلان
              </span>
            )}
          </div>
        ))}
      </div>
      <Feedback state={state} />
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "جارٍ الحفظ…" : "حفظ التوزيع"}
      </Button>
    </form>
  )
}

export function AgencySubscriptionRequestButton() {
  const [state, action, pending] = useActionState(
    requestAgencySubscriptionAction,
    initialState
  )
  return (
    <form action={action} className="space-y-3">
      <Feedback state={state} />
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "جارٍ تسجيل الطلب…" : "طلب اشتراك 30 يومًا — 40,000 د.ع"}
      </Button>
      <p className="text-xs text-muted-foreground">
        لا يتم أي خصم تلقائي. يُفعّل الاشتراك بعد مراجعة واعتماد الدفعة.
      </p>
    </form>
  )
}

export function AgencyProfileForm({ agency }: { agency: {
  name: string
  bio: string | null
  logoUrl: string | null
  coverUrl: string | null
  phone: string | null
  whatsapp: string | null
  websiteUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  citySlug: string | null
  districtSlug: string | null
  neighborhoodSlug: string | null
  addressLine: string | null
  mapLat: number | null
  mapLng: number | null
} }) {
  const [state, action, pending] = useActionState(updateAgencyProfileAction, initialState)
  const fields = [
    ["name", "اسم المكتب", agency.name],
    ["phone", "الهاتف", agency.phone],
    ["whatsapp", "واتساب", agency.whatsapp],
    ["logoUrl", "رابط الشعار", agency.logoUrl],
    ["coverUrl", "رابط الغلاف", agency.coverUrl],
    ["websiteUrl", "الموقع الإلكتروني", agency.websiteUrl],
    ["instagramUrl", "إنستغرام", agency.instagramUrl],
    ["facebookUrl", "فيسبوك", agency.facebookUrl],
    ["citySlug", "رمز المحافظة", agency.citySlug],
    ["districtSlug", "رمز المنطقة", agency.districtSlug],
    ["neighborhoodSlug", "رمز الحي", agency.neighborhoodSlug],
    ["addressLine", "العنوان", agency.addressLine],
    ["mapLat", "خط العرض", agency.mapLat],
    ["mapLng", "خط الطول", agency.mapLng],
  ] as const
  return (
    <form action={action} className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <h2 className="font-semibold text-[#0F2744]">الصفحة العامة</h2>
      </div>
      {fields.map(([name, label, value]) => (
        <label key={name} className="space-y-1.5 text-sm">
          <span>{label}</span>
          <Input name={name} defaultValue={value ?? ""} required={name === "name"} dir={name.endsWith("Url") ? "ltr" : undefined} />
        </label>
      ))}
      <label className="space-y-1.5 text-sm sm:col-span-2">
        <span>نبذة الوكالة</span>
        <textarea name="bio" defaultValue={agency.bio ?? ""} rows={5} className="w-full rounded-xl border border-input bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
      </label>
      <div className="sm:col-span-2"><Feedback state={state} /></div>
      <Button type="submit" disabled={pending} className="sm:col-span-2 sm:w-fit">
        {pending ? "جارٍ الحفظ…" : "حفظ الصفحة"}
      </Button>
    </form>
  )
}

"use client"

import { useActionState } from "react"
import { Copy, UserPlus } from "lucide-react"

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
  return (
    <p
      className={
        state.error
          ? "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          : "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
      }
    >
      {state.error ?? state.success}
    </p>
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
      <Button disabled={pending} className="gap-2">
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
  members: Array<{ userId: string; name: string; used: number; quota: number }>
}) {
  const [state, action, pending] = useActionState(
    updateAgencyQuotasAction,
    initialState
  )
  return (
    <form action={action} className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div>
        <h2 className="font-semibold text-[#0F2744]">توزيع 30 إعلانًا</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          التوزيع المتساوي يعالج الباقي بترتيب العضوية؛ اليدوي لا يسمح بتجاوز 30.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="rounded-lg border border-border p-2 text-sm">
          <input type="radio" name="mode" value="EQUAL" defaultChecked={mode === "EQUAL"} />{" "}
          متساوٍ
        </label>
        <label className="rounded-lg border border-border p-2 text-sm">
          <input type="radio" name="mode" value="MANUAL" defaultChecked={mode === "MANUAL"} />{" "}
          يدوي
        </label>
      </div>
      <div className="divide-y divide-border rounded-xl border border-border">
        {members.map((member) => (
          <label key={member.userId} className="flex items-center gap-3 px-3 py-2.5 text-sm">
            <span className="min-w-0 flex-1 truncate">{member.name}</span>
            <span className="text-xs text-muted-foreground">مستخدم {member.used}</span>
            <Input
              name={`quota:${member.userId}`}
              type="number"
              min={0}
              max={30}
              defaultValue={member.quota}
              className="w-20"
            />
          </label>
        ))}
      </div>
      <Feedback state={state} />
      <Button disabled={pending}>{pending ? "جارٍ الحفظ…" : "حفظ التوزيع"}</Button>
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
      <Button disabled={pending} className="w-full sm:w-auto">
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
      <Button disabled={pending} className="sm:col-span-2 sm:w-fit">
        {pending ? "جارٍ الحفظ…" : "حفظ الصفحة"}
      </Button>
    </form>
  )
}

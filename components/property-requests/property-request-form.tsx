"use client"

import { useActionState, useMemo, useState } from "react"
import { Loader2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createPropertyRequestAction,
  updatePropertyRequestAction,
  type PropertyRequestActionState,
} from "@/lib/actions/property-requests"
import {
  cityOptions,
  districtsOf,
  neighborhoodsOf,
} from "@/lib/locations"
import { DEAL_OPTIONS } from "@/lib/deals"
import {
  categoryLabels,
  type DealType,
  type PropertyCategory,
} from "@/lib/sample-listings"
import { cn } from "@/lib/utils"
import type { PropertyRequestCard } from "@/lib/property-requests"
import { requestStatusLabels } from "@/lib/property-requests"

const CATEGORIES = Object.keys(categoryLabels) as PropertyCategory[]

const initial: PropertyRequestActionState = {}

type Props = {
  mode?: "create" | "edit"
  initialValues?: PropertyRequestCard
}

export function PropertyRequestForm({ mode = "create", initialValues }: Props) {
  const action =
    mode === "edit" ? updatePropertyRequestAction : createPropertyRequestAction
  const [state, formAction, pending] = useActionState(action, initial)

  const [category, setCategory] = useState<PropertyCategory | "">(
    initialValues?.category ?? ""
  )
  const [deal, setDeal] = useState<DealType | "">(initialValues?.deal ?? "")
  const [city, setCity] = useState(initialValues?.citySlug ?? "")
  const [district, setDistrict] = useState(initialValues?.districtSlug ?? "")
  const [neighborhood, setNeighborhood] = useState(
    initialValues?.neighborhoodSlug ?? ""
  )
  const [status, setStatus] = useState(initialValues?.status ?? "OPEN")

  const districts = useMemo(() => (city ? districtsOf(city) : []), [city])
  const neighborhoods = useMemo(
    () => (city && district ? neighborhoodsOf(city, district) : []),
    [city, district]
  )

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edit" && initialValues ? (
        <input type="hidden" name="id" value={initialValues.id} />
      ) : null}

      <div className="rounded-2xl border border-[color:var(--brand-gold)]/25 bg-[linear-gradient(135deg,#fffdf9_0%,#f7f0e6_100%)] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0F2744] text-[color:var(--brand-gold)]">
            <Sparkles className="size-4" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#0F2744]">
              {mode === "edit" ? "تعديل طلب العقار" : "صِغ طلبك بدقة"}
            </p>
            <p className="mt-1 text-xs leading-5 text-[#6B6560]">
              كلما كانت المواصفات أوضح، زادت فرص تواصل المعلنين المناسبين معك.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">عنوان الطلب *</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={120}
          defaultValue={initialValues?.title}
          placeholder="مثال: أبحث عن شقة ٣+١ للإيجار في أربيل"
          className="h-11 rounded-xl border-[color:var(--brand-gold)]/30 bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">التفاصيل والمواصفات *</Label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          maxLength={4000}
          defaultValue={initialValues?.description}
          placeholder="اكتب الموقع المفضل، الميزانية التقريبية، عدد الغرف، أي شروط خاصة…"
          className="w-full resize-y rounded-xl border border-[color:var(--brand-gold)]/30 bg-white px-3 py-2.5 text-sm leading-6 outline-none focus:border-[color:var(--brand-gold)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>نوع العقار</Label>
          <input type="hidden" name="category" value={category} />
          <Select
            value={category}
            onValueChange={(v) => setCategory((v as PropertyCategory) ?? "")}
          >
            <SelectTrigger className="h-11 rounded-xl bg-white">
              <SelectValue placeholder="اختياري" />
              {category ? categoryLabels[category] : "اختياري"}
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {categoryLabels[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>نوع الصفقة</Label>
          <input type="hidden" name="deal" value={deal} />
          <Select
            value={deal}
            onValueChange={(v) => setDeal((v as DealType) ?? "")}
          >
            <SelectTrigger className="h-11 rounded-xl bg-white">
              <SelectValue placeholder="اختياري" />
              {deal
                ? DEAL_OPTIONS.find((d) => d.value === deal)?.label
                : "اختياري"}
            </SelectTrigger>
            <SelectContent>
              {DEAL_OPTIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>المدينة</Label>
          <input type="hidden" name="city" value={city} />
          <Select
            value={city}
            onValueChange={(v) => {
              setCity(v ?? "")
              setDistrict("")
              setNeighborhood("")
            }}
          >
            <SelectTrigger className="h-11 rounded-xl bg-white">
              <SelectValue placeholder="اختياري" />
              {cityOptions().find((c) => c.value === city)?.label ?? "اختياري"}
            </SelectTrigger>
            <SelectContent>
              {cityOptions().map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>القضاء</Label>
          <input type="hidden" name="district" value={district} />
          <Select
            value={district}
            onValueChange={(v) => {
              setDistrict(v ?? "")
              setNeighborhood("")
            }}
            disabled={!city}
          >
            <SelectTrigger className="h-11 rounded-xl bg-white">
              <SelectValue placeholder="اختياري" />
              {districts.find((d) => d.slug === district)?.label ?? "اختياري"}
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.slug} value={d.slug}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>الحي</Label>
          <input type="hidden" name="neighborhood" value={neighborhood} />
          <Select
            value={neighborhood}
            onValueChange={(v) => setNeighborhood(v ?? "")}
            disabled={!district}
          >
            <SelectTrigger className="h-11 rounded-xl bg-white">
              <SelectValue placeholder="اختياري" />
              {neighborhoods.find((n) => n.slug === neighborhood)?.label ??
                "اختياري"}
            </SelectTrigger>
            <SelectContent>
              {neighborhoods.map((n) => (
                <SelectItem key={n.slug} value={n.slug}>
                  {n.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="rooms">الغرف</Label>
          <Input
            id="rooms"
            name="rooms"
            defaultValue={initialValues?.rooms ?? ""}
            placeholder="٣+١"
            className="h-11 rounded-xl bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minBudget">أدنى ميزانية</Label>
          <Input
            id="minBudget"
            name="minBudget"
            inputMode="numeric"
            defaultValue={initialValues?.minBudgetIqd?.toString() ?? ""}
            placeholder="د.ع"
            className="h-11 rounded-xl bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxBudget">أقصى ميزانية</Label>
          <Input
            id="maxBudget"
            name="maxBudget"
            inputMode="numeric"
            defaultValue={initialValues?.maxBudgetIqd?.toString() ?? ""}
            placeholder="د.ع"
            className="h-11 rounded-xl bg-white"
          />
        </div>
        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="minArea">المساحة من / إلى</Label>
          <div className="flex gap-2">
            <Input
              id="minArea"
              name="minArea"
              inputMode="numeric"
              defaultValue={initialValues?.minAreaM2?.toString() ?? ""}
              placeholder="من"
              className="h-11 rounded-xl bg-white"
            />
            <Input
              name="maxArea"
              inputMode="numeric"
              defaultValue={initialValues?.maxAreaM2?.toString() ?? ""}
              placeholder="إلى"
              className="h-11 rounded-xl bg-white"
            />
          </div>
        </div>
      </div>

      {mode === "edit" &&
      (initialValues?.status === "OPEN" ||
        initialValues?.status === "FULFILLED" ||
        initialValues?.status === "CLOSED") ? (
        <div className="space-y-2">
          <Label>حالة الطلب</Label>
          <input type="hidden" name="status" value={status} />
          <div className="flex flex-wrap gap-2">
            {(["OPEN", "FULFILLED", "CLOSED"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatus(key)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  status === key
                    ? "border-[#0F2744] bg-[#0F2744] text-[#f8f1e6]"
                    : "border-border bg-white text-muted-foreground hover:border-[color:var(--brand-gold)]/50"
                )}
              >
                {requestStatusLabels[key]}
              </button>
            ))}
          </div>
          <p className="text-[0.7rem] text-muted-foreground">
            تعديل المحتوى يعيد الطلب لمراجعة الإدارة. تغيير الحالة فقط (منشور /
            تلبية / إغلاق) يبقى دون إعادة مراجعة.
          </p>
        </div>
      ) : mode === "edit" ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs leading-5 text-amber-900">
          {initialValues?.status === "REJECTED"
            ? "طلبك مرفوض سابقاً — الحفظ يعيد إرساله لمراجعة الإدارة."
            : "طلبك قيد المراجعة. أي تعديل يُعاد تقييمه من الإدارة قبل الظهور للعامة."}
        </p>
      ) : (
        <p className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs leading-5 text-muted-foreground">
          بعد الإرسال يذهب الطلب إلى لوحة الإدارة للمراجعة قبل نشره في تصفح
          الطلبات.
        </p>
      )}

      {state.error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-xl text-sm font-semibold shadow-[0_10px_28px_-12px_rgba(15,39,68,0.55)] sm:w-auto sm:min-w-[12rem]"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            جاري الحفظ…
          </>
        ) : mode === "edit" ? (
          "حفظ التعديلات"
        ) : (
          "نشر الطلب"
        )}
      </Button>
    </form>
  )
}

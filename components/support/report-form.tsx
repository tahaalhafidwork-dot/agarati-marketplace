"use client"

import { useActionState } from "react"
import { Flag, Send } from "lucide-react"

import {
  submitReportAction,
  type ReportActionState,
} from "@/lib/actions/reports"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initial: ReportActionState = {}

export const REPORT_KIND_OPTIONS = [
  { value: "MISLEADING_LISTING", label: "إعلان مضلّل أو غير دقيق" },
  { value: "FRAUD", label: "احتيال أو طلب مال مشبوه" },
  { value: "ILLEGAL_CONTENT", label: "محتوى مخالف أو غير قانوني" },
  { value: "IMPERSONATION", label: "انتحال هوية أو صفة" },
  { value: "TECHNICAL", label: "مشكلة تقنية في الموقع" },
  { value: "OTHER", label: "أخرى" },
] as const

export function ReportForm() {
  const [state, action, pending] = useActionState(submitReportAction, initial)

  if (state.success && state.referenceCode) {
    return (
      <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-5 text-sm">
        <p className="font-semibold text-emerald-900">{state.success}</p>
        <p className="font-mono text-xs text-emerald-800" dir="ltr">
          رقم المرجع: {state.referenceCode}
        </p>
        <p className="text-xs leading-6 text-emerald-900/80">
          احتفظ برقم المرجع عند المتابعة. قد نتواصل عبر البيانات التي قدّمتها إن
          لزم الأمر.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Flag className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-gold)]" />
        <p>
          استخدم البلاغ للمخالفات الجدية فقط. البلاغات الكيدية أو المتكررة دون
          أساس قد تؤدي لتقييد الحساب.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kind">نوع البلاغ</Label>
        <select
          id="kind"
          name="kind"
          required
          defaultValue=""
          className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            اختر التصنيف…
          </option>
          {REPORT_KIND_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="listingRef">رابط أو رقم الإعلان (إن وُجد)</Label>
        <Input
          id="listingRef"
          name="listingRef"
          placeholder="مثال: /properties/… أو رقم الإعلان"
          dir="ltr"
          className="text-start"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">وصف البلاغ</Label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          minLength={20}
          maxLength={4000}
          placeholder="ماذا حدث؟ متى؟ وأي تفاصيل تساعد المراجعة…"
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        أدخل بريداً أو هاتفاً واحداً على الأقل حتى نستطيع التواصل عند الحاجة.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contactEmail">البريد للتواصل (مطلوب إذا لم يُذكر هاتف)</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            placeholder="name@example.com"
            dir="ltr"
            className="text-start"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactPhone">الهاتف (مطلوب إذا لم يُذكر بريد)</Label>
          <Input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            placeholder="07xxxxxxxx"
            inputMode="tel"
            dir="ltr"
            className="text-start"
          />
        </div>
      </div>

      <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <input
          type="checkbox"
          name="confirm"
          required
          className="mt-0.5 size-3.5 shrink-0 rounded border-input"
        />
        <span>
          أؤكد أن المعلومات صحيحة قدر علمي، وأن إرسال بلاغ كاذب قد يترتب عليه
          إجراءات، وأن استلام البلاغ لا يعني اتخاذ قرار فوري ضد أي طرف.
        </span>
      </label>

      {state.error ? (
        <p className="rounded-md bg-destructive/10 px-2.5 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="w-full gap-1.5" disabled={pending}>
        <Send className="size-3.5" />
        {pending ? "جاري الإرسال…" : "إرسال البلاغ"}
      </Button>
    </form>
  )
}

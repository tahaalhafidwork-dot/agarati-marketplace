"use client"

import { useActionState } from "react"
import { Send } from "lucide-react"

import { submitContactLeadAction } from "@/lib/actions/listings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initial: { error?: string; success?: string } = {}

export function ContactLeadForm({
  listingId,
  isDemo,
}: {
  listingId: string
  isDemo?: boolean
}) {
  const [state, action, pending] = useActionState(
    submitContactLeadAction,
    initial
  )

  if (isDemo) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
        نموذج طلب التواصل يعمل على الإعلانات المنشورة من المعلنين فقط.
        الإعلان الحالي تجريبي للتصفح.
      </div>
    )
  }

  return (
    <form action={action} className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
      <input type="hidden" name="listingId" value={listingId} />
      <div className="space-y-1.5">
        <Label htmlFor="fromName">الاسم</Label>
        <Input id="fromName" name="fromName" required placeholder="اسمك الكامل" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="fromPhone">الهاتف</Label>
        <Input
          id="fromPhone"
          name="fromPhone"
          type="tel"
          required
          placeholder="07xxxxxxxx"
          inputMode="tel"
        />
        <p className="text-[0.65rem] text-muted-foreground">
          رقم عراقي — يُحوَّل تلقائياً للتواصل
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">الرسالة</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={3}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="أرغب بمعاينة العقار…"
        />
      </div>
      {state.error ? (
        <p className="rounded-md bg-destructive/10 px-2.5 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md bg-primary/10 px-2.5 py-2 text-sm text-primary">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" className="w-full gap-1.5" disabled={pending}>
        <Send className="size-3.5" />
        {pending ? "جاري الإرسال…" : "إرسال رسالة عبر التطبيق"}
      </Button>
    </form>
  )
}

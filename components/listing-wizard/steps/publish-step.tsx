"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ContactMethod } from "@/lib/actions/listings"
import { DEAL_OPTIONS } from "@/lib/listing-form-config"
import {
  categoryLabels,
  type DealType,
  type PropertyCategory,
} from "@/lib/sample-listings"

const contactMethodOptions: [ContactMethod, string][] = [
  ["WHATSAPP_PHONE", "واتساب واتصال فقط"],
  ["ALL", "واتساب واتصال ومراسلة"],
  ["CHAT", "مراسلة عبر التطبيق فقط"],
]

export type PublishStepProps = {
  isEdit: boolean
  category: PropertyCategory | ""
  deal: DealType | ""
  preview: string | null
  mapPin: { lat: number; lng: number } | null
  description: string
  phone: string
  whatsapp: string
  contactMethod: ContactMethod
  onDescriptionChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onWhatsappChange: (value: string) => void
  onContactMethodChange: (value: ContactMethod) => void
  descriptionError?: string | null
}

export function PublishStep({
  isEdit,
  category,
  deal,
  preview,
  mapPin,
  description,
  phone,
  whatsapp,
  contactMethod,
  onDescriptionChange,
  onPhoneChange,
  onWhatsappChange,
  onContactMethodChange,
  descriptionError,
}: PublishStepProps) {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="rounded-xl border border-border bg-[#faf6ef]/70 px-3 py-2.5 text-xs text-muted-foreground">
        <p>
          <span className="font-semibold text-[#0F2744]">ملخص: </span>
          {category ? categoryLabels[category] : ""} ·{" "}
          {deal ? DEAL_OPTIONS.find((d) => d.value === deal)?.label : ""} ·{" "}
          {preview || "—"}
          {mapPin ? " · موقع محدّد على الخريطة" : ""}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descUi">الوصف *</Label>
        <textarea
          id="descUi"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          required
          rows={5}
          className="w-full rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="اكتب وصفاً واضحاً يساعد الزائر على اتخاذ القرار…"
          aria-invalid={descriptionError ? true : undefined}
        />
        {descriptionError ? (
          <p className="text-sm text-destructive">{descriptionError}</p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phoneUi">هاتف للتواصل</Label>
          <Input
            id="phoneUi"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="07xxxxxxxxx"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="waUi">واتساب</Label>
          <Input
            id="waUi"
            type="tel"
            value={whatsapp}
            onChange={(e) => onWhatsappChange(e.target.value)}
            placeholder="07xxxxxxxxx"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>طريقة التواصل المفضّلة</Label>
        <Select
          value={contactMethod}
          onValueChange={(v) =>
            onContactMethodChange((v as ContactMethod) || "CHAT")
          }
        >
          <SelectTrigger className="w-full min-w-0">
            <SelectValue placeholder="اختر طريقة التواصل">
              {contactMethodOptions.find(([v]) => v === contactMethod)?.[1]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {contactMethodOptions.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">صور العقار</Label>
        <Input
          id="images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            const maxPerFile = 4 * 1024 * 1024
            const maxTotal = 18 * 1024 * 1024
            const tooBig = files.find((f) => f.size > maxPerFile)
            const total = files.reduce((sum, f) => sum + f.size, 0)
            if (tooBig || total > maxTotal || files.length > 8) {
              e.target.value = ""
              window.alert(
                "حد الصور: حتى 8 صور، كل صورة أقل من 4 ميجابايت، والمجموع أقل من 18 ميجابايت."
              )
            }
          }}
        />
        <p className="text-xs text-muted-foreground">
          {isEdit
            ? "صور جديدة تُضاف للإعلان الحالي (اختياري)"
            : "حتى 8 صور · JPEG/PNG/WebP · كل صورة أقل من 4 ميجابايت"}
        </p>
      </div>
    </div>
  )
}

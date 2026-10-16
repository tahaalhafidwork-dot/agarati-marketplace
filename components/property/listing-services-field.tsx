"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MAX_LISTING_SERVICES,
  MAX_SERVICE_LABEL_LENGTH,
  SUGGESTED_LISTING_SERVICES,
  normalizeServiceLabel,
} from "@/lib/listing-services"
import { cn } from "@/lib/utils"

type Props = {
  value: string[]
  onChange: (next: string[]) => void
  className?: string
  /** When false, parent form owns hidden inputs (multi-step wizards). */
  emitHidden?: boolean
}

/** Toggle suggested amenities + add custom service labels. */
export function ListingServicesField({
  value,
  onChange,
  className,
  emitHidden = true,
}: Props) {
  const [custom, setCustom] = useState("")

  function toggle(label: string) {
    if (value.includes(label)) {
      onChange(value.filter((s) => s !== label))
      return
    }
    if (value.length >= MAX_LISTING_SERVICES) return
    onChange([...value, label])
  }

  function addCustom() {
    const label = normalizeServiceLabel(custom)
    if (!label) return
    if (value.some((s) => s.toLowerCase() === label.toLowerCase())) {
      setCustom("")
      return
    }
    if (value.length >= MAX_LISTING_SERVICES) return
    onChange([...value, label])
    setCustom("")
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <Label>الخدمات</Label>
        <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
          اختر من القائمة أو أضف خدمة خاصة — تظهر في تبويب «الخدمات» داخل الإعلان.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_LISTING_SERVICES.map((label) => {
          const active = value.includes(label)
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex gap-2">
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          maxLength={MAX_SERVICE_LABEL_LENGTH}
          placeholder="خدمة أخرى (مثال: ساونا)"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addCustom()
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addCustom}>
          <Plus className="size-4" />
          إضافة
        </Button>
      </div>

      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((label) => (
            <li key={label}>
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-gold/40 bg-[#faf6ef] px-2.5 py-1 text-[0.7rem] text-primary">
                {label}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((s) => s !== label))}
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`إزالة ${label}`}
                >
                  <X className="size-3" />
                </button>
                {emitHidden ? (
                  <input type="hidden" name="services" value={label} />
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[0.7rem] text-muted-foreground">لم تُضف خدمات بعد (اختياري).</p>
      )}
    </div>
  )
}

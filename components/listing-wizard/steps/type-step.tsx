"use client"

import { CATEGORY_ICONS } from "@/lib/category-icons"
import {
  DEAL_OPTIONS,
  DAILY_DEAL_HINT,
  dailyNotAllowedMessage,
} from "@/lib/listing-form-config"
import { categoryAllowsDaily } from "@/lib/deals"
import {
  categoryLabels,
  type DealType,
  type PropertyCategory,
} from "@/lib/sample-listings"
import { cn } from "@/lib/utils"

export type TypeStepProps = {
  category: PropertyCategory | ""
  deal: DealType | ""
  onApplyCategory: (value: PropertyCategory) => void
  onDealChange: (value: DealType) => void
  onClearCategory: () => void
  onStepError: (message: string | null) => void
}

export function TypeStep({
  category,
  deal,
  onApplyCategory,
  onDealChange,
  onClearCategory,
  onStepError,
}: TypeStepProps) {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h2 className="text-base font-semibold text-[#0F2744]">
          ما نوع العقار؟
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          الاختيار يحدد الحقول في الخطوات التالية.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {(Object.keys(categoryLabels) as PropertyCategory[]).map((value) => {
          const Icon = CATEGORY_ICONS[value]
          const selected = category === value
          const blockedByDaily =
            deal === "daily" && !categoryAllowsDaily(value)
          return (
            <button
              key={value}
              type="button"
              onClick={() => {
                if (blockedByDaily) {
                  onStepError(dailyNotAllowedMessage(value))
                  return
                }
                onStepError(null)
                onApplyCategory(value)
              }}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border px-3 py-3 text-start transition",
                selected
                  ? "border-[#0F2744] bg-[#0F2744] text-[#f8f1e6] shadow-md"
                  : "border-border bg-[#fffdf9] text-[#0F2744] hover:border-[color:var(--brand-gold)]/50",
                blockedByDaily && "opacity-45"
              )}
            >
              <Icon
                className="size-5 text-[color:var(--brand-gold)]"
                strokeWidth={1.75}
              />
              <span className="text-sm font-semibold">
                {categoryLabels[value]}
              </span>
            </button>
          )
        })}
      </div>

      <div>
        <h2 className="text-base font-semibold text-[#0F2744]">نوع الصفقة</h2>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {DEAL_OPTIONS.map((opt) => {
            const selected = deal === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onDealChange(opt.value)
                  onStepError(null)
                  if (
                    opt.value === "daily" &&
                    category &&
                    !categoryAllowsDaily(category)
                  ) {
                    onClearCategory()
                  }
                }}
                className={cn(
                  "rounded-xl border px-3 py-3 text-start transition",
                  selected
                    ? "border-[color:var(--brand-gold)] bg-[linear-gradient(180deg,#c4a574,#B8956C)] text-[#0F2744] shadow-md"
                    : "border-border bg-[#fffdf9] hover:border-[color:var(--brand-gold)]/50"
                )}
              >
                <p className="text-sm font-semibold">{opt.label}</p>
                <p
                  className={cn(
                    "text-[0.65rem]",
                    selected ? "opacity-80" : "text-muted-foreground"
                  )}
                >
                  {opt.hint}
                </p>
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-[0.7rem] leading-5 text-muted-foreground">
          {DAILY_DEAL_HINT}
        </p>
      </div>
    </div>
  )
}

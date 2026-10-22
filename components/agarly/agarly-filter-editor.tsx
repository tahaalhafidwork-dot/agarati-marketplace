"use client"

import { useState } from "react"
import { SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { AgarlyFilters } from "@/lib/agarly/schema"
import { LAND_USE_LABELS } from "@/lib/land-uses"
import { iraqCities, districtsOf, neighborhoodsOf } from "@/lib/locations"
import { categoryLabels, dealLabels } from "@/lib/sample-listings"
import {
  formatPropertyFloors,
  propertyFloorOptionsForCategory,
  roomCountOptionsForCategory,
} from "@/lib/listing-attributes"

type Props = {
  filters: AgarlyFilters
  busy: boolean
  onApply: (filters: AgarlyFilters) => Promise<void>
}

const fieldClass =
  "h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15"

function numericValue(value: string): number | null {
  if (!value.trim()) return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : null
}

export function AgarlyFilterEditor({ filters, busy, onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(filters)
  const districts = draft.city ? districtsOf(draft.city) : []
  const neighborhoods = draft.city && draft.district
    ? neighborhoodsOf(draft.city, draft.district)
    : []
  const roomOptions = roomCountOptionsForCategory(draft.category ?? "")
  const propertyFloorOptions = propertyFloorOptionsForCategory(draft.category ?? "")

  function patch(value: Partial<AgarlyFilters>) {
    setDraft((current) => ({ ...current, ...value }))
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setDraft(filters)
      }}
    >
      <SheetTrigger
        disabled={busy}
        render={<Button type="button" variant="outline" size="sm" className="h-8 rounded-lg" />}
      >
        <SlidersHorizontal className="size-3.5" />
        تعديل الفلاتر
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[88dvh] w-full max-w-3xl gap-0 overflow-hidden rounded-t-[1.4rem] border-x border-border bg-[#faf8f4]"
      >
        <SheetHeader className="border-b border-border bg-card px-5 py-4 text-start">
          <SheetTitle className="font-bold text-primary">تعديل معايير البحث</SheetTitle>
          <SheetDescription>
            التحديث هنا يعيد البحث في بيانات AGARATİ مباشرة ولا يستهلك عملية ذكاء جديدة.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs font-semibold text-primary">
              نطاق النتائج
              <select
                className={fieldClass}
                value={draft.intent}
                onChange={(event) => patch({ intent: event.target.value as AgarlyFilters["intent"] })}
              >
                <option value="mixed">العقارات والمشاريع والوكالات</option>
                <option value="listings">العقارات فقط</option>
                <option value="projects">المشاريع فقط</option>
                <option value="agencies">الوكالات فقط</option>
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-semibold text-primary">
              نوع العقار
              <select
                className={fieldClass}
                value={draft.category ?? ""}
                onChange={(event) => {
                  const category = (event.target.value || null) as AgarlyFilters["category"]
                  patch({ category, landUse: category === "land" ? draft.landUse : null })
                }}
              >
                <option value="">كل الأنواع</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-semibold text-primary">
              نوع الصفقة
              <select
                className={fieldClass}
                value={draft.deal ?? ""}
                onChange={(event) => patch({ deal: (event.target.value || null) as AgarlyFilters["deal"] })}
              >
                <option value="">كل الصفقات</option>
                {Object.entries(dealLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            {draft.category === "land" ? (
              <label className="space-y-1.5 text-xs font-semibold text-primary">
                صفة استعمال الأرض
                <select
                  className={fieldClass}
                  value={draft.landUse ?? ""}
                  onChange={(event) => patch({ landUse: (event.target.value || null) as AgarlyFilters["landUse"] })}
                >
                  <option value="">كل الاستعمالات</option>
                  {Object.entries(LAND_USE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="space-y-1.5 text-xs font-semibold text-primary">
              المدينة
              <select
                className={fieldClass}
                value={draft.city ?? ""}
                onChange={(event) => patch({
                  city: event.target.value || null,
                  district: null,
                  neighborhood: null,
                })}
              >
                <option value="">كل المدن</option>
                {iraqCities.map((city) => (
                  <option key={city.slug} value={city.slug}>{city.label}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-semibold text-primary">
              القضاء
              <select
                className={fieldClass}
                value={draft.district ?? ""}
                disabled={!draft.city}
                onChange={(event) => patch({ district: event.target.value || null, neighborhood: null })}
              >
                <option value="">كل الأقضية</option>
                {districts.map((district) => (
                  <option key={district.slug} value={district.slug}>{district.label}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-semibold text-primary">
              الحي
              <select
                className={fieldClass}
                value={draft.neighborhood ?? ""}
                disabled={!draft.district}
                onChange={(event) => patch({ neighborhood: event.target.value || null })}
              >
                <option value="">كل الأحياء</option>
                {neighborhoods.map((neighborhood) => (
                  <option key={neighborhood.slug} value={neighborhood.slug}>{neighborhood.label}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-semibold text-primary">
              السعر الأدنى (د.ع)
              <input
                className={fieldClass}
                inputMode="numeric"
                min={0}
                type="number"
                value={draft.minPriceIqd ?? ""}
                onChange={(event) => patch({ minPriceIqd: numericValue(event.target.value) })}
              />
            </label>

            <label className="space-y-1.5 text-xs font-semibold text-primary">
              السعر الأعلى (د.ع)
              <input
                className={fieldClass}
                inputMode="numeric"
                min={0}
                type="number"
                value={draft.maxPriceIqd ?? ""}
                onChange={(event) => patch({ maxPriceIqd: numericValue(event.target.value) })}
              />
            </label>

            <label className="space-y-1.5 text-xs font-semibold text-primary">
              المساحة الأدنى (م²)
              <input
                className={fieldClass}
                inputMode="numeric"
                min={0}
                type="number"
                value={draft.minAreaM2 ?? ""}
                onChange={(event) => patch({ minAreaM2: numericValue(event.target.value) })}
              />
            </label>

            <label className="space-y-1.5 text-xs font-semibold text-primary">
              المساحة الأعلى (م²)
              <input
                className={fieldClass}
                inputMode="numeric"
                min={0}
                type="number"
                value={draft.maxAreaM2 ?? ""}
                onChange={(event) => patch({ maxAreaM2: numericValue(event.target.value) })}
              />
            </label>

            <label className="space-y-1.5 text-xs font-semibold text-primary">
              عدد الغرف
              <select
                className={fieldClass}
                value={draft.rooms ?? ""}
                onChange={(event) => patch({ rooms: numericValue(event.target.value) })}
              >
                <option value="">الكل</option>
                {roomOptions.map((room) => (
                  <option key={room} value={room}>{room === 0 ? "استوديو" : room}</option>
                ))}
              </select>
            </label>

            {propertyFloorOptions.length ? (
              <label className="space-y-1.5 text-xs font-semibold text-primary">
                عدد طوابق العقار
                <select
                  className={fieldClass}
                  value={draft.propertyFloors ?? ""}
                  onChange={(event) => patch({ propertyFloors: numericValue(event.target.value) })}
                >
                  <option value="">الكل</option>
                  {propertyFloorOptions.map((floor) => (
                    <option key={floor} value={floor}>
                      {formatPropertyFloors(floor, draft.category ?? undefined)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="space-y-1.5 text-xs font-semibold text-primary">
              الترتيب
              <select
                className={fieldClass}
                value={draft.sort}
                onChange={(event) => patch({ sort: event.target.value as AgarlyFilters["sort"] })}
              >
                <option value="newest">الأحدث</option>
                <option value="price-asc">السعر: الأقل أولًا</option>
                <option value="price-desc">السعر: الأعلى أولًا</option>
                <option value="area-asc">المساحة: الأصغر أولًا</option>
                <option value="area-desc">المساحة: الأكبر أولًا</option>
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-primary">
              <input
                type="checkbox"
                checked={draft.insideComplex}
                onChange={(event) => patch({ insideComplex: event.target.checked })}
                className="size-4 accent-[#0F2744]"
              />
              داخل مجمع سكني
            </label>
            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-primary">
              <input
                type="checkbox"
                checked={draft.approvedAgencyOnly}
                onChange={(event) => patch({ approvedAgencyOnly: event.target.checked })}
                className="size-4 accent-[#0F2744]"
              />
              عقارات وكالات معتمدة فقط
            </label>
          </div>
        </div>

        <SheetFooter className="flex-row border-t border-border bg-card px-4 py-3 sm:px-5">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => setDraft(filters)}
            disabled={busy}
          >
            استعادة المستخرج
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-xl"
            disabled={busy}
            onClick={() => {
              void onApply(draft)
              setOpen(false)
            }}
          >
            عرض النتائج
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

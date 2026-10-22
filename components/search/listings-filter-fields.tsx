"use client"

import type { ReactNode } from "react"

import {
  LocationFilterFields,
  type LocationFilterValue,
} from "@/components/search/location-filter-fields"
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
  formatFloorNumber,
  formatPropertyFloors,
  propertyFloorOptionsForCategory,
  roomCountOptionsForCategory,
  toEnglishNumber,
} from "@/lib/listing-attributes"
import { LAND_USE_OPTIONS, type LandUse } from "@/lib/land-uses"
import {
  CATEGORY_FIELD_FLAGS,
  dealOptionsForCategory,
  isDealAllowedForCategory,
} from "@/lib/listing-form-config"
import {
  filterFloorOptions,
  parseIQD,
} from "@/lib/listing-query"
import type { DealType, PropertyCategory } from "@/lib/sample-listings"
import { cn } from "@/lib/utils"
import {
  AIR_CONDITIONING_OPTIONS,
  type AirConditioningCode,
} from "@/lib/air-conditioning"

/** MVP deals only — short-stay rental is deferred. */
export const filterDealOptions: DealType[] = ["sale", "rent", "daily"]

export type ListingsFilterDraft = {
  deal?: DealType
  landUse?: LandUse
  location: LocationFilterValue
  rooms: string
  floor: string
  propertyFloors: string
  airConditioning?: AirConditioningCode
  minPrice: string
  maxPrice: string
  minArea: string
  maxArea: string
}

function NumericFilterSelect({
  label,
  value,
  options,
  formatOption = toEnglishNumber,
  onChange,
  compact = false,
}: {
  label: string
  value: string
  options: readonly number[]
  formatOption?: (value: number) => string
  onChange: (value: string) => void
  compact?: boolean
}) {
  return (
    <Select
      value={value || "any"}
      onValueChange={(next) => onChange(next === "any" ? "" : (next ?? ""))}
    >
      <SelectTrigger
        aria-label={label}
        className={cn(
          "h-11 w-full rounded-xl bg-card",
          compact &&
            "h-10 rounded-full border-[#0F2744]/12 bg-white px-3 text-xs font-medium text-[#0F2744] shadow-[0_2px_8px_rgba(15,39,68,0.035)] [&_svg]:text-[#9A7854]"
        )}
      >
        <SelectValue>
          {(selectedValue: string | null) =>
            selectedValue === "any" || selectedValue == null
              ? "الكل"
              : formatOption(Number(selectedValue))
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">الكل</SelectItem>
        {options.map((option) => {
          const optionLabel = formatOption(option)
          return (
            <SelectItem key={option} value={String(option)}>
              <span dir="auto">{optionLabel}</span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

type Props = {
  value: ListingsFilterDraft
  onChange: (next: ListingsFilterDraft) => void
  className?: string
  variant?: "default" | "sheet"
  category?: PropertyCategory
  catalogProjects?: Array<{
    slug: string
    name: string
    citySlug: string | null
    districtSlug: string | null
    neighborhoodSlug: string | null
  }>
}

function FilterSection({
  title,
  children,
  variant = "default",
}: {
  title: string
  children: ReactNode
  variant?: "default" | "sheet"
}) {
  return (
    <section
      className={cn(
        "min-w-0 space-y-2.5",
        variant === "sheet"
          ? "space-y-2 border-b border-[#0F2744]/8 py-3 last:border-b-0"
          : "rounded-2xl border border-border/80 bg-muted/25 p-3.5"
      )}
    >
      <div>
        <p
          className={cn(
            "font-semibold text-foreground",
            variant === "sheet" ? "text-[0.72rem] text-[#0F2744]" : "text-xs"
          )}
        >
          {title}
        </p>
      </div>
      {children}
    </section>
  )
}

export function ListingsFilterFields({
  value,
  onChange,
  className,
  variant = "default",
  category,
  catalogProjects,
}: Props) {
  const patch = (partial: Partial<ListingsFilterDraft>) =>
    onChange({ ...value, ...partial })
  const categoryDealOptions = dealOptionsForCategory(category ?? "")

  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-full",
        variant === "sheet" ? "space-y-0" : "space-y-3",
        className
      )}
    >
      <FilterSection title="نوع الصفقة" variant={variant}>
        <div
          className={cn(
            "grid min-w-0 grid-cols-3 gap-1 p-1",
            variant === "sheet"
              ? "rounded-full border border-[#0F2744]/10 bg-white shadow-[0_2px_8px_rgba(15,39,68,0.035)]"
              : "rounded-xl bg-card ring-1 ring-border"
          )}
          role="group"
          aria-label="نوع الصفقة"
        >
          {categoryDealOptions.map(({ value: key, label }) => {
            const selected = value.deal === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => patch({ deal: selected ? undefined : key })}
                className={cn(
                  "min-w-0 px-1.5 py-2.5 text-xs font-semibold transition-colors",
                  variant === "sheet" ? "rounded-full" : "rounded-lg",
                  selected
                    ? variant === "sheet"
                      ? "bg-[#0F2744] text-white shadow-[0_3px_10px_rgba(15,39,68,0.16)]"
                      : "bg-primary text-primary-foreground shadow-sm"
                    : variant === "sheet"
                      ? "text-[#0F2744]/60 hover:bg-[#0F2744]/5 hover:text-[#0F2744]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {category === "land" ? (
        <FilterSection title="نوع الأرض" variant={variant}>
          <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="نوع الأرض">
            {LAND_USE_OPTIONS.map((option) => {
              const selected = value.landUse === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    patch({ landUse: selected ? undefined : option.value })
                  }
                  className={cn(
                    "border px-2.5 py-2.5 text-xs font-semibold transition-colors last:col-span-2",
                    variant === "sheet" ? "rounded-full" : "rounded-xl",
                    selected
                      ? variant === "sheet"
                        ? "border-[#0F2744] bg-[#0F2744] text-white shadow-sm"
                        : "border-primary bg-primary text-primary-foreground shadow-sm"
                      : variant === "sheet"
                        ? "border-[#0F2744]/10 bg-white text-[#0F2744]/70 shadow-[0_2px_8px_rgba(15,39,68,0.03)] hover:border-[#B8956C]/45"
                        : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </FilterSection>
      ) : null}

      <FilterSection title="الموقع" variant={variant}>
        <LocationFilterFields
          value={value.location}
          onChange={(location) => patch({ location })}
          layout={variant === "sheet" ? "grid" : "stack"}
          compact={variant === "sheet"}
          catalogProjects={catalogProjects}
        />
      </FilterSection>

      {category && CATEGORY_FIELD_FLAGS[category].rooms ? (
        <FilterSection title="عدد الغرف" variant={variant}>
          <NumericFilterSelect
            label="عدد الغرف"
            value={value.rooms}
            options={roomCountOptionsForCategory(category)}
            onChange={(rooms) => patch({ rooms })}
            compact={variant === "sheet"}
          />
          <p className="text-[0.65rem] text-muted-foreground">
            {category === "office"
              ? "0 يعني مساحة مكتبية مفتوحة."
              : "0 يعني وحدة استوديو."}
          </p>
        </FilterSection>
      ) : null}

      {category && CATEGORY_FIELD_FLAGS[category].floorNumber ? (
        <FilterSection title="طابق الوحدة" variant={variant}>
          <NumericFilterSelect
            label="طابق الوحدة"
            value={value.floor}
            options={filterFloorOptions}
            formatOption={formatFloorNumber}
            onChange={(floor) => patch({ floor })}
            compact={variant === "sheet"}
          />
          <p className="text-[0.65rem] text-muted-foreground">
            «أرضي» للطابق 0، والأرقام السالبة للأقبية.
          </p>
        </FilterSection>
      ) : null}

      {category && CATEGORY_FIELD_FLAGS[category].propertyFloors ? (
        <FilterSection title="عدد طوابق العقار" variant={variant}>
          <NumericFilterSelect
            label="عدد طوابق العقار"
            value={value.propertyFloors}
            options={propertyFloorOptionsForCategory(category)}
            formatOption={(floorCount) =>
              formatPropertyFloors(floorCount, category)
            }
            onChange={(propertyFloors) => patch({ propertyFloors })}
            compact={variant === "sheet"}
          />
          <p className="text-[0.65rem] text-muted-foreground">
            {category === "house" || category === "villa"
              ? "فلات لطابق واحد، دوبلكس لطابقين، تربلكس لثلاثة، أو أكثر من 3 طوابق."
              : category === "apartment"
                ? "فلات لطابق واحد، دوبلكس لطابقين، وتربلكس لثلاثة طوابق."
                : "اختر عدد الطوابق التي يشغلها العقار نفسه."}
          </p>
        </FilterSection>
      ) : null}

      {category && CATEGORY_FIELD_FLAGS[category].heating ? (
        <FilterSection title="نظام التكييف" variant={variant}>
          <Select
            value={value.airConditioning ?? "any"}
            onValueChange={(next) =>
              patch({
                airConditioning:
                  next === "any"
                    ? undefined
                    : (next as AirConditioningCode | undefined),
              })
            }
          >
            <SelectTrigger
              aria-label="نظام التكييف"
              className={cn(
                "h-11 w-full rounded-xl bg-card",
                variant === "sheet" &&
                  "h-10 rounded-full border-[#0F2744]/12 bg-white px-3 text-xs font-medium text-[#0F2744] shadow-[0_2px_8px_rgba(15,39,68,0.035)] [&_svg]:text-[#9A7854]"
              )}
            >
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">الكل</SelectItem>
              {AIR_CONDITIONING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>
      ) : null}

      <FilterSection title="السعر (د.ع)" variant={variant}>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label
              htmlFor="filter-min-price"
              className="text-[0.65rem] text-muted-foreground"
            >
              من
            </Label>
            <Input
              id="filter-min-price"
              inputMode="numeric"
              placeholder="الأقل"
              value={value.minPrice}
              onChange={(e) => patch({ minPrice: e.target.value })}
              className={cn(
                "h-11 rounded-xl",
                variant === "sheet" &&
                  "h-10 rounded-full border-[#0F2744]/12 bg-white px-3 text-xs text-[#0F2744] shadow-[0_2px_8px_rgba(15,39,68,0.035)] placeholder:text-[#8A837D] focus-visible:border-[#B8956C]/65 focus-visible:ring-[#B8956C]/15"
              )}
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="filter-max-price"
              className="text-[0.65rem] text-muted-foreground"
            >
              إلى
            </Label>
            <Input
              id="filter-max-price"
              inputMode="numeric"
              placeholder="الأعلى"
              value={value.maxPrice}
              onChange={(e) => patch({ maxPrice: e.target.value })}
              className={cn(
                "h-11 rounded-xl",
                variant === "sheet" &&
                  "h-10 rounded-full border-[#0F2744]/12 bg-white px-3 text-xs text-[#0F2744] shadow-[0_2px_8px_rgba(15,39,68,0.035)] placeholder:text-[#8A837D] focus-visible:border-[#B8956C]/65 focus-visible:ring-[#B8956C]/15"
              )}
            />
          </div>
        </div>
        {(() => {
          const min = Number(String(value.minPrice).replace(/\D/g, ""))
          const max = Number(String(value.maxPrice).replace(/\D/g, ""))
          if (!String(value.minPrice).trim() || !String(value.maxPrice).trim()) return null
          if (!Number.isFinite(min) || !Number.isFinite(max) || min <= max) return null
          return (
            <p className="text-xs text-destructive">
              الحد الأدنى للسعر أكبر من الحد الأعلى.
            </p>
          )
        })()}
      </FilterSection>

      <FilterSection title="المساحة م²" variant={variant}>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label
              htmlFor="filter-min-area"
              className="text-[0.65rem] text-muted-foreground"
            >
              من
            </Label>
            <Input
              id="filter-min-area"
              inputMode="numeric"
              placeholder="80"
              value={value.minArea}
              onChange={(e) => patch({ minArea: e.target.value })}
              className={cn(
                "h-11 rounded-xl",
                variant === "sheet" &&
                  "h-10 rounded-full border-[#0F2744]/12 bg-white px-3 text-xs text-[#0F2744] shadow-[0_2px_8px_rgba(15,39,68,0.035)] placeholder:text-[#8A837D] focus-visible:border-[#B8956C]/65 focus-visible:ring-[#B8956C]/15"
              )}
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="filter-max-area"
              className="text-[0.65rem] text-muted-foreground"
            >
              إلى
            </Label>
            <Input
              id="filter-max-area"
              inputMode="numeric"
              placeholder="300"
              value={value.maxArea}
              onChange={(e) => patch({ maxArea: e.target.value })}
              className={cn(
                "h-11 rounded-xl",
                variant === "sheet" &&
                  "h-10 rounded-full border-[#0F2744]/12 bg-white px-3 text-xs text-[#0F2744] shadow-[0_2px_8px_rgba(15,39,68,0.035)] placeholder:text-[#8A837D] focus-visible:border-[#B8956C]/65 focus-visible:ring-[#B8956C]/15"
              )}
            />
          </div>
        </div>
      
        {(() => {
          const min = Number(String(value.minArea).replace(/\D/g, ""))
          const max = Number(String(value.maxArea).replace(/\D/g, ""))
          if (!String(value.minArea).trim() || !String(value.maxArea).trim()) return null
          if (!Number.isFinite(min) || !Number.isFinite(max) || min <= max) return null
          return (
            <p className="text-xs text-destructive">
              الحد الأدنى للمساحة أكبر من الحد الأعلى.
            </p>
          )
        })()}
</FilterSection>
    </div>
  )
}

export function draftFromQuery(query: {
  category?: PropertyCategory
  deal?: DealType
  landUse?: LandUse
  city?: string
  district?: string
  neighborhood?: string
  complex?: string
  rooms?: number
  floor?: number
  propertyFloors?: number
  airConditioning?: AirConditioningCode
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
}): ListingsFilterDraft {
  return {
    deal:
      query.deal &&
      query.category &&
      !isDealAllowedForCategory(query.category, query.deal)
        ? undefined
        : query.deal,
    landUse: query.category === "land" ? query.landUse : undefined,
    location: {
      city: query.city,
      district: query.district,
      neighborhood: query.neighborhood,
      complex: query.complex,
    },
    rooms:
      query.category && CATEGORY_FIELD_FLAGS[query.category].rooms
        ? query.rooms?.toString() ?? ""
        : "",
    floor:
      query.category && CATEGORY_FIELD_FLAGS[query.category].floorNumber
        ? query.floor?.toString() ?? ""
        : "",
    propertyFloors:
      query.category && CATEGORY_FIELD_FLAGS[query.category].propertyFloors
        ? query.propertyFloors?.toString() ?? ""
        : "",
    airConditioning:
      query.category && CATEGORY_FIELD_FLAGS[query.category].heating
        ? query.airConditioning
        : undefined,
    minPrice: query.minPrice?.toString() ?? "",
    maxPrice: query.maxPrice?.toString() ?? "",
    minArea: query.minArea?.toString() ?? "",
    maxArea: query.maxArea?.toString() ?? "",
  }
}

export function emptyFilterDraft(): ListingsFilterDraft {
  return {
    deal: undefined,
    landUse: undefined,
    location: {},
    rooms: "",
    floor: "",
    propertyFloors: "",
    airConditioning: undefined,
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
  }
}

export function draftToQueryPatch(draft: ListingsFilterDraft) {
  const parseBound = (value: string) => {
    const parsed = parseIQD(value)
    return parsed || undefined
  }

  return {
    deal: draft.deal,
    landUse: draft.landUse,
    city: draft.location.city,
    district: draft.location.district,
    neighborhood: draft.location.neighborhood,
    complex: draft.location.complex,
    rooms: draft.rooms ? Number(draft.rooms) : undefined,
    floor: draft.floor ? Number(draft.floor) : undefined,
    propertyFloors: draft.propertyFloors
      ? Number(draft.propertyFloors)
      : undefined,
    airConditioning: draft.airConditioning,
    minPrice: parseBound(draft.minPrice),
    maxPrice: parseBound(draft.maxPrice),
    minArea: parseBound(draft.minArea),
    maxArea: parseBound(draft.maxArea),
  }
}

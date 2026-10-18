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
  roomCountOptionsForCategory,
  toEnglishNumber,
} from "@/lib/listing-attributes"
import {
  CATEGORY_FIELD_FLAGS,
  dealOptionsForCategory,
  isDealAllowedForCategory,
} from "@/lib/listing-form-config"
import {
  filterFloorOptions,
  filterPropertyFloorOptions,
  parseIQD,
} from "@/lib/listing-query"
import type { DealType, PropertyCategory } from "@/lib/sample-listings"
import { cn } from "@/lib/utils"

/** MVP deals only — short-stay rental is deferred. */
export const filterDealOptions: DealType[] = ["sale", "rent", "daily"]

export type ListingsFilterDraft = {
  deal?: DealType
  location: LocationFilterValue
  rooms: string
  floor: string
  propertyFloors: string
  minPrice: string
  maxPrice: string
  minArea: string
  maxArea: string
}

function NumericFilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly number[]
  onChange: (value: string) => void
}) {
  return (
    <Select
      value={value || "any"}
      onValueChange={(next) => onChange(next === "any" ? "" : (next ?? ""))}
    >
      <SelectTrigger aria-label={label} className="h-11 w-full rounded-xl bg-card">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">الكل</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={String(option)}>
            {toEnglishNumber(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type Props = {
  value: ListingsFilterDraft
  onChange: (next: ListingsFilterDraft) => void
  className?: string
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
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-2.5 rounded-2xl border border-border/80 bg-muted/25 p-3.5">
      <p className="text-xs font-semibold text-foreground">{title}</p>
      {children}
    </section>
  )
}

export function ListingsFilterFields({
  value,
  onChange,
  className,
  category,
  catalogProjects,
}: Props) {
  const patch = (partial: Partial<ListingsFilterDraft>) =>
    onChange({ ...value, ...partial })
  const categoryDealOptions = dealOptionsForCategory(category ?? "")

  return (
    <div className={cn("space-y-3", className)}>
      <FilterSection title="نوع الصفقة">
        <div
          className="grid grid-cols-3 gap-1 rounded-xl bg-card p-1 ring-1 ring-border"
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
                  "rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </FilterSection>

      <FilterSection title="الموقع">
        <LocationFilterFields
          value={value.location}
          onChange={(location) => patch({ location })}
          catalogProjects={catalogProjects}
        />
      </FilterSection>

      {category && CATEGORY_FIELD_FLAGS[category].rooms ? (
        <FilterSection title="عدد الغرف">
          <NumericFilterSelect
            label="عدد الغرف"
            value={value.rooms}
            options={roomCountOptionsForCategory(category)}
            onChange={(rooms) => patch({ rooms })}
          />
          <p className="text-[0.65rem] text-muted-foreground">
            {category === "office"
              ? "0 يعني مساحة مكتبية مفتوحة."
              : "0 يعني وحدة استوديو."}
          </p>
        </FilterSection>
      ) : null}

      {category && CATEGORY_FIELD_FLAGS[category].floorNumber ? (
        <FilterSection title="طابق الوحدة">
          <NumericFilterSelect
            label="طابق الوحدة"
            value={value.floor}
            options={filterFloorOptions}
            onChange={(floor) => patch({ floor })}
          />
          <p className="text-[0.65rem] text-muted-foreground">
            0 أرضي، والأرقام السالبة للأقبية.
          </p>
        </FilterSection>
      ) : null}

      {category && CATEGORY_FIELD_FLAGS[category].propertyFloors ? (
        <FilterSection title="عدد طوابق العقار">
          <NumericFilterSelect
            label="عدد طوابق العقار"
            value={value.propertyFloors}
            options={filterPropertyFloorOptions}
            onChange={(propertyFloors) => patch({ propertyFloors })}
          />
          <p className="text-[0.65rem] text-muted-foreground">
            2 دوبلكس، و3 تربلكس.
          </p>
        </FilterSection>
      ) : null}

      <FilterSection title="السعر (د.ع)">
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
              className="h-11 rounded-xl"
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
              className="h-11 rounded-xl"
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

      <FilterSection title="المساحة م²">
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
              className="h-11 rounded-xl"
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
              className="h-11 rounded-xl"
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
  city?: string
  district?: string
  neighborhood?: string
  complex?: string
  rooms?: number
  floor?: number
  propertyFloors?: number
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
    minPrice: query.minPrice?.toString() ?? "",
    maxPrice: query.maxPrice?.toString() ?? "",
    minArea: query.minArea?.toString() ?? "",
    maxArea: query.maxArea?.toString() ?? "",
  }
}

export function emptyFilterDraft(): ListingsFilterDraft {
  return {
    deal: undefined,
    location: {},
    rooms: "",
    floor: "",
    propertyFloors: "",
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
    city: draft.location.city,
    district: draft.location.district,
    neighborhood: draft.location.neighborhood,
    complex: draft.location.complex,
    rooms: draft.rooms ? Number(draft.rooms) : undefined,
    floor: draft.floor ? Number(draft.floor) : undefined,
    propertyFloors: draft.propertyFloors
      ? Number(draft.propertyFloors)
      : undefined,
    minPrice: parseBound(draft.minPrice),
    maxPrice: parseBound(draft.maxPrice),
    minArea: parseBound(draft.minArea),
    maxArea: parseBound(draft.maxArea),
  }
}

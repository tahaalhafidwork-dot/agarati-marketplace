"use client"

import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  availableCities,
  availableComplexes,
  availableDistricts,
  availableNeighborhoods,
} from "@/lib/listing-query"

export type LocationFilterValue = {
  city?: string
  district?: string
  neighborhood?: string
  complex?: string
}

type Props = {
  value: LocationFilterValue
  onChange: (next: LocationFilterValue) => void
  className?: string
  layout?: "stack" | "grid"
  compact?: boolean
  catalogProjects?: Array<{
    slug: string
    name: string
    citySlug: string | null
    districtSlug: string | null
    neighborhoodSlug: string | null
  }>
}

function NativeLocationSelect({
  label,
  options,
  value,
  onChange,
  disabled,
  placeholder,
  compact = false,
}: {
  label: string
  options: { slug: string; label: string }[]
  value?: string
  onChange: (slug: string | undefined) => void
  disabled?: boolean
  placeholder: string
  compact?: boolean
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label
        className={cn(
          "text-[0.7rem] font-medium text-muted-foreground",
          compact && "text-[0.63rem] text-[#6B6560]"
        )}
      >
        {label}
      </label>
      <div className="relative min-w-0">
        <select
          value={value ?? ""}
          disabled={disabled || options.length === 0}
          onChange={(e) => onChange(e.target.value || undefined)}
          className={cn(
            "h-11 w-full min-w-0 max-w-full appearance-none rounded-xl border border-border bg-card pe-9 ps-2.5 text-sm text-foreground outline-none transition",
            "focus:border-primary focus:ring-2 focus:ring-primary/15",
            "disabled:cursor-not-allowed disabled:bg-muted/40 disabled:text-muted-foreground",
            value && "border-primary/40",
            compact &&
              "h-10 rounded-full border-[#0F2744]/12 bg-white pe-9 ps-3 text-xs font-medium text-[#0F2744] shadow-[0_2px_8px_rgba(15,39,68,0.035)] focus:border-[#B8956C]/65 focus:ring-[#B8956C]/15 disabled:!border-[#0F2744]/6 disabled:!bg-[#F0ECE6] disabled:!text-[#8A837D] disabled:!shadow-none",
            compact && value && "border-[#B8956C]/50"
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.slug} value={opt.slug}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
            compact && "size-3.5 text-[#9A7854]",
            compact && disabled && "text-[#8A837D]"
          )}
          aria-hidden
        />
      </div>
    </div>
  )
}

/** Cascading مدينة → قضاء → حي → مجمع — native selects for sheet reliability. */
export function LocationFilterFields({
  value,
  onChange,
  className,
  layout = "stack",
  compact = false,
  catalogProjects,
}: Props) {
  const cities = availableCities()
  const districts = availableDistricts(value.city)
  const neighborhoods = availableNeighborhoods(value.city, value.district)
  const complexes = availableComplexes(
    value.city,
    value.district,
    value.neighborhood,
    catalogProjects
  )

  return (
    <div
      className={cn(
        layout === "grid"
          ? "grid w-full min-w-0 max-w-full grid-cols-2 gap-x-2.5 gap-y-3"
          : "space-y-3",
        className
      )}
    >
      <NativeLocationSelect
        label="المدينة"
        options={cities.map((c) => ({ slug: c.value, label: c.label }))}
        value={value.city}
        onChange={(city) =>
          onChange({
            city,
            district: undefined,
            neighborhood: undefined,
            complex: undefined,
          })
        }
        placeholder="اختر المدينة"
        compact={compact}
      />

      <NativeLocationSelect
        label="القضاء"
        options={districts.map((d) => ({ slug: d.slug, label: d.label }))}
        value={value.district}
        onChange={(district) =>
          onChange({
            ...value,
            district,
            neighborhood: undefined,
            complex: undefined,
          })
        }
        disabled={!value.city}
        placeholder="اختر القضاء"
        compact={compact}
      />

      <NativeLocationSelect
        label="الحي"
        options={neighborhoods.map((n) => ({ slug: n.slug, label: n.label }))}
        value={value.neighborhood}
        onChange={(neighborhood) =>
          onChange({
            ...value,
            neighborhood,
            complex: undefined,
          })
        }
        disabled={!value.district}
        placeholder="اختر الحي"
        compact={compact}
      />

      {(complexes.length > 0 || value.neighborhood) && (
        <NativeLocationSelect
          label="المجمع السكني"
          options={complexes.map((c) => ({ slug: c.slug, label: c.label }))}
          value={value.complex}
          onChange={(complex) => onChange({ ...value, complex })}
          disabled={!value.neighborhood}
          placeholder="اختر المجمع"
          compact={compact}
        />
      )}
    </div>
  )
}

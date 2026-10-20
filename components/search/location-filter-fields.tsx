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
}: {
  label: string
  options: { slug: string; label: string }[]
  value?: string
  onChange: (slug: string | undefined) => void
  disabled?: boolean
  placeholder: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[0.7rem] font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <select
          value={value ?? ""}
          disabled={disabled || options.length === 0}
          onChange={(e) => onChange(e.target.value || undefined)}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-border bg-card pe-10 ps-3 text-sm text-foreground outline-none transition",
            "focus:border-primary focus:ring-2 focus:ring-primary/15",
            "disabled:cursor-not-allowed disabled:bg-muted/40 disabled:text-muted-foreground",
            value && "border-primary/40"
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
          className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
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
    <div className={cn("space-y-3", className)}>
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
      />

      {(complexes.length > 0 || value.neighborhood) && (
        <NativeLocationSelect
          label="المجمع السكني"
          options={complexes.map((c) => ({ slug: c.slug, label: c.label }))}
          value={value.complex}
          onChange={(complex) => onChange({ ...value, complex })}
          disabled={!value.neighborhood}
          placeholder="اختر المجمع"
        />
      )}
    </div>
  )
}

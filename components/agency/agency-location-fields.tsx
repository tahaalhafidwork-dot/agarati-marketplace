"use client"

import { useState } from "react"

import {
  LocationFilterFields,
  type LocationFilterValue,
} from "@/components/search/location-filter-fields"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  required?: boolean
  defaultCity?: string | null
  defaultDistrict?: string | null
  defaultNeighborhood?: string | null
  defaultAddressLine?: string | null
  /** Field name prefix for FormData keys */
  cityName?: string
  districtName?: string
  neighborhoodName?: string
  addressName?: string
}

/** Cascading office location for agency signup / upgrade forms. */
export function AgencyLocationFields({
  className,
  required = true,
  defaultCity,
  defaultDistrict,
  defaultNeighborhood,
  defaultAddressLine,
  cityName = "agencyCitySlug",
  districtName = "agencyDistrictSlug",
  neighborhoodName = "agencyNeighborhoodSlug",
  addressName = "agencyAddressLine",
}: Props) {
  const [value, setValue] = useState<LocationFilterValue>({
    city: defaultCity ?? undefined,
    district: defaultDistrict ?? undefined,
    neighborhood: defaultNeighborhood ?? undefined,
  })

  return (
    <div className={cn("space-y-3", className)}>
      <input type="hidden" name={cityName} value={value.city ?? ""} required={required} />
      <input
        type="hidden"
        name={districtName}
        value={value.district ?? ""}
        required={required}
      />
      <input
        type="hidden"
        name={neighborhoodName}
        value={value.neighborhood ?? ""}
        required={required}
      />
      <LocationFilterFields
        value={value}
        onChange={(next) =>
          setValue({
            city: next.city,
            district: next.district,
            neighborhood: next.neighborhood,
          })
        }
      />
      <div className="space-y-1.5">
        <Label htmlFor={addressName}>
          عنوان المكتب{" "}
          {required ? <span className="text-destructive">*</span> : "(اختياري)"}
        </Label>
        <Input
          id={addressName}
          name={addressName}
          required={required}
          defaultValue={defaultAddressLine ?? ""}
          placeholder="شارع، أقرب نقطة دالة…"
        />
      </div>
    </div>
  )
}

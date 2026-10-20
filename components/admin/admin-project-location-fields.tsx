"use client"

import { useMemo, useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  districtsOf,
  iraqCities,
  neighborhoodsOf,
} from "@/lib/locations"

type Props = {
  initialCitySlug?: string | null
  initialDistrictSlug?: string | null
  initialNeighborhoodSlug?: string | null
  initialWebsiteUrl?: string | null
  idPrefix?: string
}

/**
 * Geographic location for a Project: مدينة → قضاء → حي (Arabic labels).
 * Website URL is separate and labeled clearly as الموقع الإلكتروني.
 */
export function AdminProjectLocationFields({
  initialCitySlug = null,
  initialDistrictSlug = null,
  initialNeighborhoodSlug = null,
  initialWebsiteUrl = null,
  idPrefix = "proj",
}: Props) {
  const [city, setCity] = useState(initialCitySlug ?? "")
  const [district, setDistrict] = useState(initialDistrictSlug ?? "")
  const [neighborhood, setNeighborhood] = useState(
    initialNeighborhoodSlug ?? ""
  )

  const districts = useMemo(() => (city ? districtsOf(city) : []), [city])
  const neighborhoods = useMemo(
    () => (city && district ? neighborhoodsOf(city, district) : []),
    [city, district]
  )

  const selectClass =
    "h-10 w-full rounded-lg border border-input bg-background px-2.5 text-sm"

  return (
    <>
      <div className="space-y-1.5 sm:col-span-2">
        <p className="text-xs font-semibold text-[#0F2744]">الموقع الجغرافي</p>
        <p className="text-[0.7rem] text-muted-foreground">
          اختر المدينة ثم القضاء ثم الحي من القوائم — يظهر للعامة بدون عنوان
          شارع.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-city`}>المدينة</Label>
        <select
          id={`${idPrefix}-city`}
          name="citySlug"
          value={city}
          onChange={(e) => {
            setCity(e.target.value)
            setDistrict("")
            setNeighborhood("")
          }}
          className={selectClass}
        >
          <option value="">—</option>
          {iraqCities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-district`}>القضاء</Label>
        <select
          id={`${idPrefix}-district`}
          name="districtSlug"
          value={district}
          onChange={(e) => {
            setDistrict(e.target.value)
            setNeighborhood("")
          }}
          disabled={!city}
          className={selectClass}
        >
          <option value="">—</option>
          {districts.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-neighborhood`}>الحي</Label>
        <select
          id={`${idPrefix}-neighborhood`}
          name="neighborhoodSlug"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          disabled={!district}
          className={selectClass}
        >
          <option value="">—</option>
          {neighborhoods.map((n) => (
            <option key={n.slug} value={n.slug}>
              {n.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-web`}>الموقع الإلكتروني (اختياري)</Label>
        <Input
          id={`${idPrefix}-web`}
          name="websiteUrl"
          type="url"
          dir="ltr"
          placeholder="https://…"
          defaultValue={initialWebsiteUrl ?? ""}
        />
        <p className="text-[0.65rem] text-muted-foreground">
          رابط موقع المشروع على الإنترنت — وليس العنوان الجغرافي.
        </p>
      </div>
    </>
  )
}

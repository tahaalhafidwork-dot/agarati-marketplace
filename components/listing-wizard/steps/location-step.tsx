"use client"

import { useMemo } from "react"
import { MapPin } from "lucide-react"

import { LocationMapPicker } from "@/components/map/location-map-picker"
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
  mergeComplexOptions,
  namesLikelySame,
  type ComplexOption,
} from "@/lib/complex-options"
import { cityOptions } from "@/lib/locations"

type LocationOption = { slug: string; label: string }

export type CatalogProject = {
  slug: string
  name: string
  citySlug: string | null
  districtSlug: string | null
  neighborhoodSlug: string | null
}

export type LocationStepProps = {
  city: string
  district: string
  neighborhood: string
  complex: string
  proposedComplexName: string
  inComplex: boolean
  proposingNew: boolean
  streetPrivate: string
  mapPin: { lat: number; lng: number } | null
  mapKey: string
  preview: string | null
  districts: LocationOption[]
  neighborhoods: LocationOption[]
  catalogProjects: CatalogProject[]
  onCityChange: (value: string) => void
  onDistrictChange: (value: string) => void
  onNeighborhoodChange: (value: string) => void
  onComplexChange: (value: string) => void
  onProposedComplexNameChange: (value: string) => void
  onInComplexChange: (value: boolean) => void
  onProposingNewChange: (value: boolean) => void
  onStreetPrivateChange: (value: string) => void
  onMapPinChange: (value: { lat: number; lng: number } | null) => void
  onResetMapPin: () => void
}

export function LocationStep({
  city,
  district,
  neighborhood,
  complex,
  proposedComplexName,
  inComplex,
  proposingNew,
  streetPrivate,
  mapPin,
  mapKey,
  preview,
  districts,
  neighborhoods,
  catalogProjects,
  onCityChange,
  onDistrictChange,
  onNeighborhoodChange,
  onComplexChange,
  onProposedComplexNameChange,
  onInComplexChange,
  onProposingNewChange,
  onStreetPrivateChange,
  onMapPinChange,
  onResetMapPin,
}: LocationStepProps) {
  const complexes: ComplexOption[] = useMemo(
    () =>
      mergeComplexOptions(
        catalogProjects,
        city || undefined,
        district || undefined,
        neighborhood || undefined
      ),
    [catalogProjects, city, district, neighborhood]
  )

  const similarHits = useMemo(() => {
    if (!proposedComplexName.trim() || proposedComplexName.trim().length < 2) {
      return []
    }
    return complexes.filter((c) =>
      namesLikelySame(c.label, proposedComplexName)
    )
  }, [complexes, proposedComplexName])

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold text-[#0F2744]">
          <MapPin className="size-4 text-[color:var(--brand-gold)]" />
          الموقع العام
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          يظهر للعامة المدينة والحي فقط — ثم حدّد موقعاً تقريبياً على الخريطة.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>المدينة *</Label>
          <Select
            value={city}
            onValueChange={(v) => {
              onCityChange(v ?? "")
              onDistrictChange("")
              onNeighborhoodChange("")
              onComplexChange("")
              onProposedComplexNameChange("")
              onProposingNewChange(false)
              onResetMapPin()
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المدينة" />
              {cityOptions().find((c) => c.value === city)?.label ?? ""}
            </SelectTrigger>
            <SelectContent>
              {cityOptions().map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>القضاء *</Label>
          <Select
            value={district}
            onValueChange={(v) => {
              onDistrictChange(v ?? "")
              onNeighborhoodChange("")
              onComplexChange("")
              onProposedComplexNameChange("")
              onProposingNewChange(false)
              onResetMapPin()
            }}
            disabled={!city}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر القضاء" />
              {districts.find((d) => d.slug === district)?.label ?? ""}
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.slug} value={d.slug}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>الحي *</Label>
          <Select
            value={neighborhood}
            onValueChange={(v) => {
              onNeighborhoodChange(v ?? "")
              onComplexChange("")
              onProposedComplexNameChange("")
              onProposingNewChange(false)
              onResetMapPin()
            }}
            disabled={!district}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحي" />
              {neighborhoods.find((n) => n.slug === neighborhood)?.label ?? ""}
            </SelectTrigger>
            <SelectContent>
              {neighborhoods.map((n) => (
                <SelectItem key={n.slug} value={n.slug}>
                  {n.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-[#faf6ef]/50 p-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#0F2744]">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            checked={inComplex}
            onChange={(e) => {
              const on = e.target.checked
              onInComplexChange(on)
              if (!on) {
                onComplexChange("")
                onProposedComplexNameChange("")
                onProposingNewChange(false)
              }
            }}
            disabled={!neighborhood}
          />
          العقار داخل مجمع سكني
        </label>

        {inComplex ? (
          <div className="space-y-3">
            {!proposingNew ? (
              <>
                <div className="space-y-2">
                  <Label>اسم المجمع *</Label>
                  <Select
                    value={complex}
                    onValueChange={(v) => onComplexChange(v ?? "")}
                    disabled={!neighborhood}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المجمع" />
                      {complexes.find((c) => c.slug === complex)?.label ?? ""}
                    </SelectTrigger>
                    <SelectContent>
                      {complexes.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {complexes.length === 0 ? (
                    <p className="text-[0.7rem] text-muted-foreground">
                      لا مجمعات معتمدة في هذا الحي بعد — اقترح اسماً جديداً.
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="text-xs font-medium text-destructive underline-offset-2 hover:underline"
                  onClick={() => {
                    onProposingNewChange(true)
                    onComplexChange("")
                  }}
                >
                  المجمع غير موجود؟ اقترح اسماً
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="proposedComplex">اسم المجمع المقترح *</Label>
                  <button
                    type="button"
                    className="text-[0.7rem] text-muted-foreground underline-offset-2 hover:underline"
                    onClick={() => {
                      onProposingNewChange(false)
                      onProposedComplexNameChange("")
                    }}
                  >
                    العودة للاختيار
                  </button>
                </div>
                <Input
                  id="proposedComplex"
                  value={proposedComplexName}
                  onChange={(e) => {
                    const v = e.target.value
                    onProposedComplexNameChange(v)
                    const hit = complexes.find((c) =>
                      namesLikelySame(c.label, v)
                    )
                    if (hit && namesLikelySame(hit.label, v.trim())) {
                      /* keep typing; suggestions shown below */
                    }
                  }}
                  placeholder="مثال: فلوريا سيتي"
                />
                {similarHits.length > 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-2 text-xs text-amber-950">
                    <p className="mb-1.5 font-medium">
                      مجمع مشابه موجود — اختره بدل إنشاء مكرر:
                    </p>
                    <ul className="space-y-1">
                      {similarHits.map((h) => (
                        <li key={h.slug}>
                          <button
                            type="button"
                            className="font-medium text-[#0F2744] underline-offset-2 hover:underline"
                            onClick={() => {
                              onComplexChange(h.slug)
                              onProposedComplexNameChange("")
                              onProposingNewChange(false)
                            }}
                          >
                            {h.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <p className="text-[0.7rem] text-muted-foreground">
                  سيُراجع الاسم مع الإعلان من الإدارة قبل إضافة المجمع للقائمة.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="streetUi">المحلة/الشارع</Label>
        <Input
          id="streetUi"
          value={streetPrivate}
          onChange={(e) => onStreetPrivateChange(e.target.value)}
        />
      </div>

      {preview ? (
        <p className="text-xs text-muted-foreground">
          يظهر للعامة: <strong className="text-[#0F2744]">{preview}</strong>
        </p>
      ) : null}

      <div className="space-y-2">
        <Label>الموقع على الخريطة *</Label>
        {city && district && neighborhood ? (
          <LocationMapPicker
            key={mapKey}
            location={{
              city,
              district,
              neighborhood,
              complex: complex || undefined,
            }}
            value={mapPin}
            onChange={onMapPinChange}
          />
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-8 text-center text-sm text-muted-foreground">
            أكمل المدينة والقضاء والحي أولاً لفتح الخريطة
          </p>
        )}
      </div>
    </div>
  )
}

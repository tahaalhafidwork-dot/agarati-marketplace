"use client"

import { ListingServicesField } from "@/components/property/listing-services-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DEAL_OPTIONS,
  type CategoryFieldFlags,
} from "@/lib/listing-form-config"
import {
  categoryLabels,
  type DealType,
  type PropertyCategory,
} from "@/lib/sample-listings"

export type DetailsStepProps = {
  category: PropertyCategory | ""
  deal: DealType | ""
  flags: CategoryFieldFlags
  title: string
  price: string
  rooms: string
  areaM2: string
  floor: string
  heating: string
  furnished: string
  services: string[]
  onTitleChange: (value: string) => void
  onPriceChange: (value: string) => void
  onRoomsChange: (value: string) => void
  onAreaM2Change: (value: string) => void
  onFloorChange: (value: string) => void
  onHeatingChange: (value: string) => void
  onFurnishedChange: (value: string) => void
  onServicesChange: (value: string[]) => void
}

export function DetailsStep({
  category,
  deal,
  flags,
  title,
  price,
  rooms,
  areaM2,
  floor,
  heating,
  furnished,
  services,
  onTitleChange,
  onPriceChange,
  onRoomsChange,
  onAreaM2Change,
  onFloorChange,
  onHeatingChange,
  onFurnishedChange,
  onServicesChange,
}: DetailsStepProps) {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="rounded-xl border border-[color:var(--brand-gold)]/20 bg-[#faf6ef]/80 px-3 py-2.5 text-xs text-[#0F2744]">
        <span className="font-semibold">
          {category ? categoryLabels[category] : ""} ·{" "}
          {deal ? DEAL_OPTIONS.find((d) => d.value === deal)?.label : ""}
        </span>
        <span className="mt-0.5 block text-muted-foreground">
          {flags.detailsHint}
        </span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="titleUi">عنوان الإعلان *</Label>
        <Input
          id="titleUi"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={
            category === "land" ? "قطعة أرض للبيع في …" : "شقة للبيع في عنكاوا"
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="priceUi">
            {deal === "daily" ? "السعر لليلة (د.ع) *" : "السعر (د.ع) *"}
          </Label>
          <Input
            id="priceUi"
            inputMode="numeric"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            placeholder={deal === "daily" ? "150000" : "185000000"}
          />
          {deal === "daily" ? (
            <p className="text-[0.65rem] text-muted-foreground">
              سيظهر للعامة كسعر لليلة واحدة.
            </p>
          ) : null}
        </div>
        {flags.areaM2 ? (
          <div className="space-y-2">
            <Label htmlFor="areaUi">
              المساحة م²
              {category === "land" || category === "farm" ? " *" : ""}
            </Label>
            <Input
              id="areaUi"
              inputMode="numeric"
              value={areaM2}
              onChange={(e) => onAreaM2Change(e.target.value)}
              placeholder="135"
            />
          </div>
        ) : null}
        {flags.rooms ? (
          <div className="space-y-2">
            <Label htmlFor="roomsUi">الغرف</Label>
            <Input
              id="roomsUi"
              value={rooms}
              onChange={(e) => onRoomsChange(e.target.value)}
              placeholder="٣+١"
            />
          </div>
        ) : null}
        {flags.floor ? (
          <div className="space-y-2">
            <Label htmlFor="floorUi">
              {category === "building" ? "الطوابق / الوصف" : "الطابق"}
            </Label>
            <Input
              id="floorUi"
              value={floor}
              onChange={(e) => onFloorChange(e.target.value)}
              placeholder={category === "building" ? "٨ طوابق" : "٦ / ١٢"}
            />
          </div>
        ) : null}
        {flags.heating ? (
          <div className="space-y-2">
            <Label htmlFor="heatUi">التدفئة</Label>
            <Input
              id="heatUi"
              value={heating}
              onChange={(e) => onHeatingChange(e.target.value)}
              placeholder="مركزي"
            />
          </div>
        ) : null}
        {flags.furnished ? (
          <div className="space-y-2">
            <Label htmlFor="furnUi">الأثاث</Label>
            <Input
              id="furnUi"
              value={furnished}
              onChange={(e) => onFurnishedChange(e.target.value)}
              placeholder="فارغ / مفروش"
            />
          </div>
        ) : null}
      </div>

      {flags.services ? (
        <ListingServicesField
          value={services}
          onChange={onServicesChange}
          emitHidden={false}
        />
      ) : null}
    </div>
  )
}

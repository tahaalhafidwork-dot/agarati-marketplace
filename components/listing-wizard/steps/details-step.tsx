"use client"

import { ListingServicesField } from "@/components/property/listing-services-field"
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
  BUILDING_FLOOR_OPTIONS,
  FLOOR_NUMBER_OPTIONS,
  FURNISHED_OPTIONS,
  formatFloorNumber,
  formatPropertyFloors,
  propertyFloorOptionsForCategory,
  roomCountOptionsForCategory,
  toEnglishNumber,
} from "@/lib/listing-attributes"
import { AIR_CONDITIONING_OPTIONS } from "@/lib/air-conditioning"
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
  roomCount: string
  areaM2: string
  floorNumber: string
  propertyFloors: string
  buildingFloors: string
  heating: string
  furnished: string
  services: string[]
  onTitleChange: (value: string) => void
  onPriceChange: (value: string) => void
  onRoomCountChange: (value: string) => void
  onAreaM2Change: (value: string) => void
  onFloorNumberChange: (value: string) => void
  onPropertyFloorsChange: (value: string) => void
  onBuildingFloorsChange: (value: string) => void
  onHeatingChange: (value: string) => void
  onFurnishedChange: (value: string) => void
  onServicesChange: (value: string[]) => void
}

function NumberSelect({
  id,
  value,
  options,
  placeholder,
  formatOption = toEnglishNumber,
  onChange,
}: {
  id: string
  value: string
  options: readonly number[]
  placeholder: string
  formatOption?: (value: number) => string
  onChange: (value: string) => void
}) {
  return (
    <Select value={value || null} onValueChange={(next) => onChange(next ?? "")}>
      <SelectTrigger id={id} className="h-10 w-full bg-white">
        <SelectValue placeholder={placeholder}>
          {(selectedValue: string | null) =>
            selectedValue == null
              ? placeholder
              : formatOption(Number(selectedValue))
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => {
          const label = formatOption(option)
          return (
            <SelectItem key={option} value={String(option)}>
              <span dir="auto">{label}</span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

export function DetailsStep({
  category,
  deal,
  flags,
  title,
  price,
  roomCount,
  areaM2,
  floorNumber,
  propertyFloors,
  buildingFloors,
  heating,
  furnished,
  services,
  onTitleChange,
  onPriceChange,
  onRoomCountChange,
  onAreaM2Change,
  onFloorNumberChange,
  onPropertyFloorsChange,
  onBuildingFloorsChange,
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
            <Label htmlFor="roomCountUi">عدد الغرف *</Label>
            <NumberSelect
              id="roomCountUi"
              value={roomCount}
              options={roomCountOptionsForCategory(category)}
              onChange={onRoomCountChange}
              placeholder="اختر العدد"
            />
            <p className="text-[0.65rem] text-muted-foreground">
              {category === "office"
                ? "اختر 0 للمساحة المفتوحة؛ لا تُقبل كتابة حرة لضمان دقة البحث."
                : "اختر 0 للاستوديو؛ لا تُقبل كتابة حرة لضمان دقة البحث."}
            </p>
          </div>
        ) : null}
        {flags.floorNumber ? (
          <div className="space-y-2">
            <Label htmlFor="floorNumberUi">رقم طابق الوحدة *</Label>
            <NumberSelect
              id="floorNumberUi"
              value={floorNumber}
              options={FLOOR_NUMBER_OPTIONS}
              formatOption={formatFloorNumber}
              onChange={onFloorNumberChange}
              placeholder="اختر الطابق"
            />
            <p className="text-[0.65rem] text-muted-foreground">
              «أرضي» للطابق 0، والأرقام السالبة = قبو.
            </p>
          </div>
        ) : null}
        {flags.propertyFloors ? (
          <div className="space-y-2">
            <Label htmlFor="propertyFloorsUi">عدد طوابق العقار *</Label>
            <NumberSelect
              id="propertyFloorsUi"
              value={propertyFloors}
              options={propertyFloorOptionsForCategory(category)}
              formatOption={(floorCount) =>
                formatPropertyFloors(floorCount, category)
              }
              onChange={onPropertyFloorsChange}
              placeholder="اختر العدد"
            />
            <p className="text-[0.65rem] text-muted-foreground">
              {category === "house" || category === "villa"
                ? "فلات لطابق واحد، دوبلكس لطابقين، تربلكس لثلاثة، أو أكثر من 3 طوابق."
                : category === "apartment"
                  ? "فلات لطابق واحد، دوبلكس لطابقين، وتربلكس لثلاثة طوابق؛ المقصود الطوابق التي تشغلها الوحدة نفسها."
                  : "اختر عدد الطوابق التي يشغلها العقار نفسه."}
            </p>
          </div>
        ) : null}
        {flags.buildingFloors ? (
          <div className="space-y-2">
            <Label htmlFor="buildingFloorsUi">إجمالي طوابق المبنى *</Label>
            <NumberSelect
              id="buildingFloorsUi"
              value={buildingFloors}
              options={BUILDING_FLOOR_OPTIONS}
              onChange={onBuildingFloorsChange}
              placeholder="اختر العدد"
            />
            <p className="text-[0.65rem] text-muted-foreground">
              يختلف عن عدد طوابق الوحدة أو العقار المعلن.
            </p>
          </div>
        ) : null}
        {flags.heating ? (
          <div className="space-y-2">
            <Label htmlFor="heatUi">نظام التكييف *</Label>
            <Select
              value={heating}
              onValueChange={(value) => onHeatingChange(value ?? "")}
            >
              <SelectTrigger id="heatUi" className="h-10 w-full bg-white">
                <SelectValue placeholder="اختر نظام التكييف" />
              </SelectTrigger>
              <SelectContent>
                {AIR_CONDITIONING_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        {flags.furnished ? (
          <div className="space-y-2">
            <Label htmlFor="furnUi">الأثاث *</Label>
            <Select
              value={furnished}
              onValueChange={(value) => onFurnishedChange(value ?? "")}
            >
              <SelectTrigger id="furnUi" className="h-10 w-full bg-white">
                <SelectValue placeholder="اختر حالة الأثاث" />
              </SelectTrigger>
              <SelectContent>
                {FURNISHED_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

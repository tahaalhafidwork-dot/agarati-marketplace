"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  createListingAction,
  updateListingAction,
  type ContactMethod,
  type ListingActionState,
} from "@/lib/actions/listings"
import {
  CATEGORY_FIELD_FLAGS,
  dailyNotAllowedMessage,
  isDealAllowedForCategory,
  LISTING_WIZARD_STEPS,
  type ListingWizardStepId,
} from "@/lib/listing-form-config"
import {
  districtsOf,
  formatPublicArea,
  neighborhoodsOf,
} from "@/lib/locations"
import type { DealType, PropertyCategory } from "@/lib/sample-listings"
import { categoryLabels, dealLabels } from "@/lib/sample-listings"
import { cn } from "@/lib/utils"
import { namesLikelySame } from "@/lib/complex-options"

import { DetailsStep } from "./steps/details-step"
import { LocationStep, type CatalogProject } from "./steps/location-step"
import { PublishStep } from "./steps/publish-step"
import { TypeStep } from "./steps/type-step"

const initial: ListingActionState = {}

function stepIndex(id: ListingWizardStepId) {
  return LISTING_WIZARD_STEPS.findIndex((s) => s.id === id)
}

export type ListingWizardInitial = {
  listingId: string
  category: PropertyCategory
  deal: DealType
  title: string
  price: string
  rooms: string
  areaM2: string
  floor: string
  heating: string
  furnished: string
  services: string[]
  city: string
  district: string
  neighborhood: string
  complex: string
  proposedComplexName?: string
  streetPrivate: string
  mapLat: number | null
  mapLng: number | null
  contactMethod: ContactMethod
  phone: string
  whatsapp: string
  description: string
  /** Current listing status — used for rejected resubmit copy */
  status?: "DRAFT" | "PENDING" | "ACTIVE" | "REJECTED" | "EXPIRED"
  moderationNote?: string | null
}

export function NewListingForm({
  initialValues,
  catalogProjects = [],
}: {
  initialValues?: ListingWizardInitial
  catalogProjects?: CatalogProject[]
}) {
  const isEdit = Boolean(initialValues?.listingId)
  const isResubmit = initialValues?.status === "REJECTED"
  const [state, action, pending] = useActionState(
    isEdit ? updateListingAction : createListingAction,
    initial
  )
  const [step, setStep] = useState<ListingWizardStepId>(
    isEdit ? "details" : "type"
  )

  const [category, setCategory] = useState<PropertyCategory | "">(
    initialValues?.category ?? ""
  )
  const [deal, setDeal] = useState<DealType | "">(initialValues?.deal ?? "")
  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [price, setPrice] = useState(initialValues?.price ?? "")
  const [rooms, setRooms] = useState(initialValues?.rooms ?? "")
  const [areaM2, setAreaM2] = useState(initialValues?.areaM2 ?? "")
  const [floor, setFloor] = useState(initialValues?.floor ?? "")
  const [heating, setHeating] = useState(initialValues?.heating ?? "")
  const [furnished, setFurnished] = useState(initialValues?.furnished ?? "")
  const [services, setServices] = useState<string[]>(
    initialValues?.services ?? []
  )

  const [city, setCity] = useState(initialValues?.city ?? "")
  const [district, setDistrict] = useState(initialValues?.district ?? "")
  const [neighborhood, setNeighborhood] = useState(
    initialValues?.neighborhood ?? ""
  )
  const [complex, setComplex] = useState(initialValues?.complex ?? "")
  const [proposedComplexName, setProposedComplexName] = useState(
    initialValues?.proposedComplexName ?? ""
  )
  const [inComplex, setInComplex] = useState(
    Boolean(initialValues?.complex || initialValues?.proposedComplexName)
  )
  const [proposingNew, setProposingNew] = useState(
    Boolean(initialValues?.proposedComplexName && !initialValues?.complex)
  )
  const [streetPrivate, setStreetPrivate] = useState(
    initialValues?.streetPrivate ?? ""
  )
  const [mapPin, setMapPin] = useState<{ lat: number; lng: number } | null>(
    initialValues?.mapLat != null && initialValues?.mapLng != null
      ? { lat: initialValues.mapLat, lng: initialValues.mapLng }
      : null
  )

  const [contactMethod, setContactMethod] = useState<ContactMethod>(
    initialValues?.contactMethod ?? "ALL"
  )
  const [phone, setPhone] = useState(initialValues?.phone ?? "")
  const [whatsapp, setWhatsapp] = useState(initialValues?.whatsapp ?? "")
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  )
  const [stepError, setStepError] = useState<string | null>(null)
  const submitLock = useRef(false)

  useEffect(() => {
    if (state.error) submitLock.current = false
  }, [state.error])

  const flags = category
    ? CATEGORY_FIELD_FLAGS[category]
    : CATEGORY_FIELD_FLAGS.apartment

  const districts = useMemo(() => (city ? districtsOf(city) : []), [city])
  const neighborhoods = useMemo(
    () => (city && district ? neighborhoodsOf(city, district) : []),
    [city, district]
  )

  const mapKey = `${city}|${district}|${neighborhood}`

  function applyCategory(value: PropertyCategory) {
    setCategory(value)
    const f = CATEGORY_FIELD_FLAGS[value]
    if (!f.rooms) setRooms("")
    if (!f.floor) setFloor("")
    if (!f.heating) setHeating("")
    if (!f.furnished) setFurnished("")
    if (!f.services) setServices([])
  }

  const preview =
    city && district && neighborhood
      ? formatPublicArea({
          city,
          district,
          neighborhood,
          complex: complex || undefined,
          street: streetPrivate.trim() || undefined,
        })
      : null

  const currentIdx = stepIndex(step)
  const progressPct = ((currentIdx + 1) / LISTING_WIZARD_STEPS.length) * 100

  function goNext() {
    setStepError(null)
    if (step === "type") {
      if (!category || !deal) {
        setStepError("اختر نوع العقار ونوع الصفقة للمتابعة.")
        return
      }
      if (!isDealAllowedForCategory(category, deal)) {
        setStepError(dailyNotAllowedMessage(category))
        return
      }
      setStep("details")
      return
    }
    if (step === "details") {
      if (!title.trim()) {
        setStepError("أدخل عنوان الإعلان.")
        return
      }
      if (!price.replace(/\D/g, "")) {
        setStepError("أدخل السعر بالأرقام.")
        return
      }
      if (flags.areaM2 && !areaM2.replace(/\D/g, "")) {
        // area optional soft - allow skip for flexibility? User said land needs area - soft require for land
        if (category === "land" || category === "farm") {
          setStepError("أدخل المساحة بالمتر المربع.")
          return
        }
      }
      setStep("location")
      return
    }
    if (step === "location") {
      if (!city || !district || !neighborhood) {
        setStepError("أكمل المدينة والقضاء والحي.")
        return
      }
      if (inComplex) {
        if (proposingNew) {
          const name = proposedComplexName.trim()
          if (name.length < 2) {
            setStepError("أدخل اسم المجمع المقترح أو اختر مجمعاً موجوداً.")
            return
          }
          const clash = catalogProjects.find(
            (p) =>
              p.citySlug === city && namesLikelySame(p.name, name)
          )
          if (clash) {
            setStepError(
              `المجمع «${clash.name}» موجود — اختره من القائمة بدل اقتراح مكرر.`
            )
            return
          }
        } else if (!complex) {
          setStepError("اختر المجمع أو اقترح اسماً جديداً.")
          return
        }
      }
      if (!mapPin) {
        setStepError("حدّد موقعاً تقريبياً على الخريطة.")
        return
      }
      setStep("publish")
    }
  }

  function goBack() {
    setStepError(null)
    if (step === "details") setStep("type")
    else if (step === "location") setStep("details")
    else if (step === "publish") setStep("location")
  }

  return (
    <form
      action={step === "publish" ? action : undefined}
      className="mx-auto w-full max-w-2xl space-y-5 px-4 py-6 md:py-8 lg:max-w-5xl"
      onSubmit={(e) => {
        // Intermediate steps never hit the server — only advance the wizard.
        if (step !== "publish") {
          e.preventDefault()
          e.stopPropagation()
          goNext()
          return
        }
        if (!mapPin) {
          e.preventDefault()
          setStepError("حدّد موقعاً على الخريطة قبل الإرسال.")
          setStep("location")
          return
        }
        if (!description.trim()) {
          e.preventDefault()
          setStepError("أدخل وصف الإعلان.")
          return
        }
        if (submitLock.current || pending) {
          e.preventDefault()
          return
        }
        submitLock.current = true
      }}
    >
      {/* Hidden fields always submitted */}
      {isEdit && initialValues ? (
        <input type="hidden" name="listingId" value={initialValues.listingId} />
      ) : null}
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="deal" value={deal} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="price" value={price} />
      <input type="hidden" name="rooms" value={flags.rooms ? rooms : ""} />
      <input type="hidden" name="areaM2" value={flags.areaM2 ? areaM2 : ""} />
      <input type="hidden" name="floor" value={flags.floor ? floor : ""} />
      <input type="hidden" name="heating" value={flags.heating ? heating : ""} />
      <input
        type="hidden"
        name="furnished"
        value={flags.furnished ? furnished : ""}
      />
      <input type="hidden" name="city" value={city} />
      <input type="hidden" name="district" value={district} />
      <input type="hidden" name="neighborhood" value={neighborhood} />
      <input
        type="hidden"
        name="inComplex"
        value={inComplex ? "1" : "0"}
      />
      <input
        type="hidden"
        name="complex"
        value={inComplex && !proposingNew ? complex : ""}
      />
      <input
        type="hidden"
        name="proposedComplexName"
        value={inComplex && proposingNew ? proposedComplexName : ""}
      />
      <input type="hidden" name="streetPrivate" value={streetPrivate} />
      <input type="hidden" name="mapLat" value={mapPin?.lat ?? ""} />
      <input type="hidden" name="mapLng" value={mapPin?.lng ?? ""} />
      <input type="hidden" name="contactMethod" value={contactMethod} />
      <input type="hidden" name="phone" value={phone} />
      <input type="hidden" name="whatsapp" value={whatsapp} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="publish" value="1" />
      {flags.services
        ? services.map((s) => (
            <input key={s} type="hidden" name="services" value={s} />
          ))
        : null}

      <div className="space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-6 lg:space-y-0">
      <div className="min-w-0 space-y-5">
      <header className="space-y-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#0F2744] md:text-2xl">
            {isResubmit
              ? "تعديل وإعادة الإرسال"
              : isEdit
                ? "تعديل الإعلان"
                : "إضافة إعلان"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isResubmit
              ? "عدّل ما يلزم ثم أرسل الإعلان مجدداً للمراجعة الإدارية."
              : isEdit
                ? "بعد الحفظ يُعاد الإعلان للمراجعة الإدارية قبل الظهور للعامة مجدداً."
                : "خطوات قصيرة — يُراجع الإعلان قبل الظهور للعامة."}
          </p>
        </div>

        {isResubmit ? (
          <div className="rounded-xl border border-red-200/80 bg-red-50/70 px-3 py-2.5 text-xs leading-5 text-red-900">
            <p className="font-semibold">هذا الإعلان مرفوض حالياً</p>
            {initialValues?.moderationNote ? (
              <p className="mt-1 text-red-800/90">
                سبب الرفض: {initialValues.moderationNote}
              </p>
            ) : null}
            <p className="mt-1 text-red-800/80">
              بعد الحفظ يتحول إلى «قيد المراجعة» حتى توافق الإدارة.
            </p>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-[#0F2744]/8">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#B8956C,#0F2744)] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <ol className="grid grid-cols-4 gap-1">
            {LISTING_WIZARD_STEPS.map((s, i) => {
              const done = i < currentIdx
              const active = s.id === step
              return (
                <li
                  key={s.id}
                  className={cn(
                    "rounded-lg px-1.5 py-1.5 text-center",
                    active && "bg-[#0F2744]/[0.06]",
                    done && "opacity-80"
                  )}
                >
                  <p
                    className={cn(
                      "mx-auto mb-1 flex size-6 items-center justify-center rounded-full text-[0.65rem] font-bold",
                      done || active
                        ? "bg-[#0F2744] text-[color:var(--brand-gold)]"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {done ? (
                      <Check className="size-3.5" strokeWidth={2.5} />
                    ) : (
                      i + 1
                    )}
                  </p>
                  <p
                    className={cn(
                      "text-[0.65rem] font-semibold",
                      active ? "text-[#0F2744]" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </p>
                  <p className="hidden text-[0.55rem] text-muted-foreground sm:block">
                    {s.hint}
                  </p>
                </li>
              )
            })}
          </ol>
        </div>
      </header>

      {(state.error || stepError) && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {stepError || state.error}
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-[color:var(--brand-gold)]/25 bg-card shadow-[0_10px_40px_rgba(15,39,68,0.06)]">
        {step === "type" ? (
          <TypeStep
            category={category}
            deal={deal}
            onApplyCategory={applyCategory}
            onDealChange={setDeal}
            onClearCategory={() => setCategory("")}
            onStepError={setStepError}
          />
        ) : null}

        {step === "details" ? (
          <DetailsStep
            category={category}
            deal={deal}
            flags={flags}
            title={title}
            price={price}
            rooms={rooms}
            areaM2={areaM2}
            floor={floor}
            heating={heating}
            furnished={furnished}
            services={services}
            onTitleChange={setTitle}
            onPriceChange={setPrice}
            onRoomsChange={setRooms}
            onAreaM2Change={setAreaM2}
            onFloorChange={setFloor}
            onHeatingChange={setHeating}
            onFurnishedChange={setFurnished}
            onServicesChange={setServices}
          />
        ) : null}

        {step === "location" ? (
          <LocationStep
            city={city}
            district={district}
            neighborhood={neighborhood}
            complex={complex}
            proposedComplexName={proposedComplexName}
            inComplex={inComplex}
            proposingNew={proposingNew}
            streetPrivate={streetPrivate}
            mapPin={mapPin}
            mapKey={mapKey}
            preview={preview}
            districts={districts}
            neighborhoods={neighborhoods}
            catalogProjects={catalogProjects}
            onCityChange={setCity}
            onDistrictChange={setDistrict}
            onNeighborhoodChange={setNeighborhood}
            onComplexChange={setComplex}
            onProposedComplexNameChange={setProposedComplexName}
            onInComplexChange={setInComplex}
            onProposingNewChange={setProposingNew}
            onStreetPrivateChange={setStreetPrivate}
            onMapPinChange={setMapPin}
            onResetMapPin={() => setMapPin(null)}
          />
        ) : null}

        {step === "publish" ? (
          <PublishStep
            isEdit={isEdit}
            category={category}
            deal={deal}
            preview={preview}
            mapPin={mapPin}
            description={description}
            phone={phone}
            whatsapp={whatsapp}
            contactMethod={contactMethod}
            onDescriptionChange={setDescription}
            onPhoneChange={setPhone}
            onWhatsappChange={setWhatsapp}
            onContactMethodChange={setContactMethod}
            descriptionError={
              step === "publish" && !description.trim() ? stepError : null
            }
          />
        ) : null}

        <footer className="flex items-center gap-2 border-t border-border bg-[#fffdf9]/80 px-4 py-3 md:px-6">
          {step !== "type" ? (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={pending}
              className="gap-1.5"
            >
              <ArrowRight className="size-4" />
              السابق
            </Button>
          ) : (
            <span className="flex-1" />
          )}

          <div className="ms-auto flex gap-2">
            {step !== "publish" ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  goNext()
                }}
                className="min-w-28 gap-1.5 bg-[#0F2744] hover:bg-[#0F2744]/90"
              >
                التالي
                <ArrowLeft className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={pending || !mapPin}
                className="min-w-36 gap-1.5 bg-[#0F2744] hover:bg-[#0F2744]/90"
              >
                {pending
                  ? "جاري الحفظ…"
                  : isResubmit
                    ? "حفظ وإعادة الإرسال للمراجعة"
                    : isEdit
                      ? "حفظ وإرسال للمراجعة"
                      : "إرسال للمراجعة"}
                <Check className="size-4 text-[color:var(--brand-gold)]" />
              </Button>
            )}
          </div>
        </footer>
      </section>
      </div>

      <aside className="sticky top-20 hidden space-y-3 self-start rounded-xl border border-border bg-card p-3.5 lg:block">
        <p className="text-xs font-semibold text-[#0F2744]">ملخص الإعلان</p>
        <dl className="space-y-2 text-[0.7rem]">
          <div>
            <dt className="text-muted-foreground">الخطوة</dt>
            <dd className="font-medium text-[#0F2744]">
              {LISTING_WIZARD_STEPS[currentIdx]?.label ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">النوع</dt>
            <dd className="font-medium text-[#0F2744]">
              {category ? categoryLabels[category] : "—"}
              {deal ? ` · ${dealLabels[deal]}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">العنوان</dt>
            <dd className="line-clamp-2 font-medium text-[#0F2744]">
              {title.trim() || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">السعر</dt>
            <dd className="font-semibold text-[color:var(--brand-gold)]">
              {price.trim() && !Number.isNaN(Number(price))
                ? `${Number(price).toLocaleString("en-US")} د.ع`
                : price.trim() || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">الموقع</dt>
            <dd className="line-clamp-3 font-medium text-[#0F2744]">
              {preview ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">الخريطة</dt>
            <dd className="font-medium text-[#0F2744]">
              {mapPin ? "محدّد" : "غير محدّد"}
            </dd>
          </div>
        </dl>
      </aside>
      </div>
    </form>
  )
}

"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronLeft,
  CircleAlert,
  Columns2,
  List,
  LoaderCircle,
  Map,
  MapPin,
  MessageCircleQuestion,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react"

import { AgarlyFilterEditor } from "@/components/agarly/agarly-filter-editor"
import { BrowseListingsMapLazy } from "@/components/map/browse-listings-map-lazy"
import { ListingImage } from "@/components/property/listing-image"
import { ListingResultRow } from "@/components/property/listing-result-row"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { getCity, districtsOf, neighborhoodsOf } from "@/lib/locations"
import { LAND_USE_LABELS } from "@/lib/land-uses"
import { categoryLabels, dealLabels } from "@/lib/sample-listings"
import type { QuotaSnapshot } from "@/lib/agarly/quota"
import type { AgarlyClarification, AgarlyFilters } from "@/lib/agarly/schema"
import type { AgarlySearchResults } from "@/lib/agarly/search"
import { formatEnglishNumber } from "@/lib/numerals"
import { formatPropertyFloors } from "@/lib/listing-attributes"
import { cn } from "@/lib/utils"

type Props = { sessionPresent: boolean; providerConfigured: boolean }
type View = "list" | "map" | "split"
type SearchPayload = {
  filters: AgarlyFilters
  results: AgarlySearchResults
  quota?: QuotaSnapshot
}
type ClarificationPayload = {
  filters: AgarlyFilters
  clarification: AgarlyClarification
  quota?: QuotaSnapshot
}
type PendingClarification = AgarlyClarification & {
  originalPrompt: string
  filters: AgarlyFilters
}

const EXAMPLES = [
  "شقة للبيع في أربيل بثلاث غرف وبحد أقصى 180 مليون",
  "منزل للإيجار في بغداد مساحته أكثر من 200 متر",
  "مشاريع سكنية معتمدة في السليمانية",
]

const categoryLabel: Record<NonNullable<AgarlyFilters["category"]>, string> = categoryLabels

function filterChips(filters: AgarlyFilters) {
  const chips: Array<{ id: string; label: string; next: AgarlyFilters }> = []
  const add = (id: string, label: string, patch: Partial<AgarlyFilters>) =>
    chips.push({ id, label, next: { ...filters, ...patch } })
  if (filters.category) add("category", categoryLabel[filters.category], { category: null, landUse: null })
  if (filters.deal) add("deal", dealLabels[filters.deal], { deal: null })
  if (filters.landUse) add("landUse", LAND_USE_LABELS[filters.landUse], { landUse: null })
  if (filters.city) {
    add("city", getCity(filters.city)?.label ?? filters.city, {
      city: null, district: null, neighborhood: null,
    })
  }
  if (filters.city && filters.district) {
    const label = districtsOf(filters.city).find((item) => item.slug === filters.district)?.label
    add("district", label ?? filters.district, { district: null, neighborhood: null })
  }
  if (filters.city && filters.district && filters.neighborhood) {
    const label = neighborhoodsOf(filters.city, filters.district).find(
      (item) => item.slug === filters.neighborhood,
    )?.label
    add("neighborhood", label ?? filters.neighborhood, { neighborhood: null })
  }
  if (filters.projectQuery) add("project", filters.projectQuery, { projectQuery: null, complex: null, insideComplex: false })
  if (filters.agencyQuery) add("agency", filters.agencyQuery, { agencyQuery: null })
  if (filters.rooms != null) add("rooms", `${filters.rooms} غرف`, { rooms: null })
  if (filters.propertyFloors != null) {
    add(
      "floors",
      formatPropertyFloors(filters.propertyFloors, filters.category ?? undefined),
      { propertyFloors: null },
    )
  }
  if (filters.minPriceIqd != null) add("minPrice", `من ${formatEnglishNumber(filters.minPriceIqd)} د.ع`, { minPriceIqd: null })
  if (filters.maxPriceIqd != null) add("maxPrice", `حتى ${formatEnglishNumber(filters.maxPriceIqd)} د.ع`, { maxPriceIqd: null })
  if (filters.minAreaM2 != null) add("minArea", `من ${formatEnglishNumber(filters.minAreaM2)} م²`, { minAreaM2: null })
  if (filters.maxAreaM2 != null) add("maxArea", `حتى ${formatEnglishNumber(filters.maxAreaM2)} م²`, { maxAreaM2: null })
  filters.services.forEach((service, index) =>
    add(`service-${index}`, service, { services: filters.services.filter((_, i) => i !== index) }),
  )
  return chips
}

function resultSummary(results: AgarlySearchResults) {
  const parts = [
    results.counts.listings ? `${results.counts.listings} عقار` : null,
    results.counts.projects ? `${results.counts.projects} مشروع` : null,
    results.counts.agencies ? `${results.counts.agencies} وكالة` : null,
  ].filter(Boolean)
  return parts.length ? `وجدنا ${parts.join("، ")} وفق طلبك.` : "لم نجد نتائج مطابقة حاليًا. جرّب وصفًا أوسع."
}

export function AgarlySearchExperience({ sessionPresent, providerConfigured }: Props) {
  const [prompt, setPrompt] = useState("")
  const [payload, setPayload] = useState<SearchPayload | null>(null)
  const [quota, setQuota] = useState<QuotaSnapshot | null>(null)
  const [view, setView] = useState<View>("list")
  const [status, setStatus] = useState<"idle" | "searching" | "refining">("idle")
  const [error, setError] = useState<string | null>(null)
  const [clarification, setClarification] = useState<PendingClarification | null>(null)
  const [clarificationAnswer, setClarificationAnswer] = useState("")
  const requestSequence = useRef(0)
  const resultsRef = useRef<HTMLDivElement>(null)
  const clarificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sessionPresent) return
    let cancelled = false
    fetch("/api/agarly/quota", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null
        return (await response.json()) as { quota?: QuotaSnapshot }
      })
      .then((data) => {
        if (!cancelled && data?.quota) setQuota(data.quota)
      })
      .catch(() => undefined)
    return () => { cancelled = true }
  }, [sessionPresent])

  const chips = useMemo(() => (payload ? filterChips(payload.filters) : []), [payload])
  const isBusy = status !== "idle"

  async function submitSearch(explicitPrompt?: string) {
    const clean = (explicitPrompt ?? prompt).trim()
    if (clean.length < 3 || isBusy || !sessionPresent || !providerConfigured) return
    const sequence = ++requestSequence.current
    setStatus("searching")
    setError(null)
    setClarification(null)
    try {
      const response = await fetch("/api/agarly/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: clean, requestId: crypto.randomUUID() }),
      })
      const data = (await response.json()) as (SearchPayload | ClarificationPayload) & {
        error?: string
        quota?: QuotaSnapshot
      }
      if (sequence !== requestSequence.current) return
      if (!response.ok) {
        if (data.quota) setQuota(data.quota)
        throw new Error(data.error || "تعذر تنفيذ البحث الذكي.")
      }
      if (data.quota) setQuota(data.quota)
      if ("clarification" in data && data.clarification) {
        setPayload(null)
        setClarification({ ...data.clarification, originalPrompt: clean, filters: data.filters })
        setClarificationAnswer("")
        requestAnimationFrame(() =>
          clarificationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
        )
        return
      }
      setPayload(data as SearchPayload)
      setView("list")
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }))
    } catch (caught) {
      if (sequence === requestSequence.current) {
        setError(caught instanceof Error ? caught.message : "تعذر تنفيذ البحث الذكي.")
      }
    } finally {
      if (sequence === requestSequence.current) setStatus("idle")
    }
  }

  function answerClarification(value: string) {
    if (!clarification || isBusy) return
    const answer = value.trim()
    if (!answer) return
    const followUpPrompt = `${clarification.originalPrompt.slice(0, 340)}. توضيح المستخدم: ${answer}`.slice(0, 500)
    setPrompt(followUpPrompt)
    void submitSearch(followUpPrompt)
  }

  function selectClarificationOption(option: AgarlyClarification["options"][number]) {
    if (!clarification || isBusy) return
    const filters = { ...clarification.filters, ...option.location }
    setClarification(null)
    void applyFilters(filters)
  }

  async function applyFilters(filters: AgarlyFilters) {
    if (isBusy) return
    const sequence = ++requestSequence.current
    setStatus("refining")
    setError(null)
    try {
      const response = await fetch("/api/agarly/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters }),
      })
      const data = (await response.json()) as SearchPayload & { error?: string }
      if (sequence !== requestSequence.current) return
      if (!response.ok) throw new Error(data.error || "تعذر تحديث النتائج.")
      setPayload((current) => ({ ...data, quota: current?.quota }))
    } catch (caught) {
      if (sequence === requestSequence.current) {
        setError(caught instanceof Error ? caught.message : "تعذر تحديث النتائج.")
      }
    } finally {
      if (sequence === requestSequence.current) setStatus("idle")
    }
  }

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] w-full overflow-x-hidden bg-[#f7f3ec] pb-20 text-foreground">
      <section className="relative isolate overflow-hidden border-b border-brand-gold/25 bg-[linear-gradient(145deg,#fffdf8_0%,#f5ecdf_58%,#eadbc8_100%)] text-primary">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(184,149,108,0.2),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(255,255,255,0.72),transparent_38%)]" />
        <div className="relative mx-auto box-border w-full max-w-5xl px-4 pb-9 pt-5 sm:px-6 md:pb-12 md:pt-8">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-primary/65 transition hover:text-primary">
            <ArrowLeft className="size-3.5 rotate-180" /> الرئيسية
          </Link>
          <div className="mx-auto mt-7 max-w-3xl text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-brand-gold/30 bg-white/65 shadow-[0_10px_30px_rgba(15,39,68,0.08)] backdrop-blur">
              <Sparkles className="size-5 text-brand-gold" />
            </div>
            <p className="mt-4 text-[0.68rem] font-semibold tracking-[0.2em] text-brand-gold uppercase">AGARATİ INTELLIGENCE</p>
            <h1 className="mt-2 text-balance text-2xl font-bold leading-tight tracking-tight sm:text-4xl">احكِ لنا عن عقارك المثالي</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              ابحث بلغتك الطبيعية، ودع أغارلي يساعدك في العثور على العقارات والمشاريع المناسبة.
            </p>
          </div>

          <div className="mx-auto mt-7 w-full min-w-0 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.35rem] border border-brand-gold/30 bg-white/55 shadow-[0_24px_70px_rgba(15,39,68,0.12)] backdrop-blur-md sm:max-w-3xl">
            <div className="m-2 min-w-0 overflow-hidden rounded-2xl bg-white p-2 text-foreground">
              <label htmlFor="agarly-prompt" className="sr-only">صف العقار الذي تبحث عنه</label>
              <textarea
                id="agarly-prompt"
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.target.value.slice(0, 500))
                  if (clarification) setClarification(null)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    void submitSearch()
                  }
                }}
                disabled={!sessionPresent || isBusy}
                rows={3}
                placeholder="مثال: شقة للبيع في أربيل، 3 غرف، حتى 180 مليون دينار…"
                className="min-h-24 w-full min-w-0 max-w-full resize-none rounded-xl border-0 bg-transparent px-3 py-3 text-sm leading-7 outline-none placeholder:text-muted-foreground/75 disabled:opacity-60 sm:text-base"
              />
              <div className="flex min-w-0 flex-col-reverse gap-2 border-t border-border/70 px-1 pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <div className="flex min-w-0 items-center justify-center gap-1.5 text-center text-[0.68rem] text-muted-foreground sm:justify-start sm:text-start">
                  <ShieldCheck className="size-3.5 text-emerald-700" />
                  لا نرسل بيانات حسابك إلى مزود الذكاء
                </div>
                <Button onClick={() => void submitSearch()} disabled={!sessionPresent || !providerConfigured || prompt.trim().length < 3 || isBusy} className="h-10 w-full rounded-xl px-4 shadow-sm sm:w-auto">
                  {status === "searching" ? <LoaderCircle className="animate-spin" /> : <Search />}
                  {status === "searching" ? "جاري التحليل" : "ابحث بذكاء"}
                </Button>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-2">
            {EXAMPLES.map((example) => (
              <button key={example} type="button" onClick={() => setPrompt(example)} disabled={!sessionPresent || isBusy} className="rounded-full border border-brand-gold/25 bg-white/55 px-3 py-1.5 text-[0.68rem] text-primary/75 transition hover:border-brand-gold/55 hover:bg-white/85 hover:text-primary disabled:opacity-50">
                {example}
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <span className="rounded-full border border-brand-gold/25 bg-white/45 px-3 py-1 text-[0.68rem] text-primary/65">
              {quota ? `${quota.remaining} من ${quota.limit} عمليات متبقية خلال 3 ساعات` : "10 عمليات بحث ذكية كل 3 ساعات"}
            </span>
          </div>
        </div>
      </section>

      {!sessionPresent ? (
        <section className="mx-auto mt-8 max-w-xl px-4 text-center">
          <div className="rounded-2xl border border-brand-gold/25 bg-card p-6 shadow-[0_16px_45px_rgba(15,39,68,0.07)]">
            <Sparkles className="mx-auto size-6 text-brand-gold" />
            <h2 className="mt-3 text-lg font-bold text-primary">Agarly مخصص لأعضاء AGARATİ</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">سجّل الدخول وابحث عبر الذكاء الاصطناعي، واستلم نتائج مرتبطة ببيانات السوق الحقيقية.</p>
            <Link href="/login?next=/agarly" className={cn(buttonVariants({ size: "lg" }), "mt-5 rounded-xl px-5")}>تسجيل الدخول</Link>
          </div>
        </section>
      ) : !providerConfigured ? (
        <section className="mx-auto mt-8 max-w-xl px-4">
          <div className="flex gap-3 rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-950">
            <CircleAlert className="mt-0.5 size-5 shrink-0" />
            <div><p className="font-bold">البحث الذكي بانتظار إعداد مفتاح المزود</p><p className="mt-1 leading-6 text-amber-900/80">الواجهة جاهزة، لكن الخادم لن يرسل أي طلب قبل إضافة المفتاح بأمان إلى متغيرات البيئة.</p></div>
          </div>
        </section>
      ) : null}

      {error ? (
        <div className="mx-auto mt-5 max-w-3xl px-4" role="alert">
          <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" /><p className="flex-1">{error}</p>
            <button type="button" onClick={() => setError(null)} aria-label="إغلاق"><X className="size-4" /></button>
          </div>
        </div>
      ) : null}

      {clarification ? (
        <section ref={clarificationRef} className="mx-auto mt-6 max-w-2xl px-4" aria-live="polite">
          <div className="overflow-hidden rounded-2xl border border-brand-gold/35 bg-card shadow-[0_16px_45px_rgba(15,39,68,0.08)]">
            <div className="flex items-start gap-3 border-b border-border bg-[#fbf7f0] px-4 py-4 sm:px-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <MessageCircleQuestion className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-brand-gold uppercase">توضيح سريع</p>
                <h2 className="mt-1 text-sm font-bold leading-6 text-primary sm:text-base">{clarification.question}</h2>
              </div>
            </div>
            <div className="space-y-4 p-4 sm:p-5">
              {clarification.options.length ? (
                <div className="grid gap-2 sm:grid-cols-3" aria-label="خيارات التوضيح">
                  {clarification.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isBusy}
                      onClick={() => selectClarificationOption(option)}
                      className="min-h-11 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-primary transition hover:border-brand-gold hover:bg-[#fbf7f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 disabled:opacity-50"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-col gap-2 sm:flex-row">
                <label htmlFor="agarly-clarification" className="sr-only">اكتب توضيحك</label>
                <input
                  id="agarly-clarification"
                  value={clarificationAnswer}
                  onChange={(event) => setClarificationAnswer(event.target.value.slice(0, 120))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      answerClarification(clarificationAnswer)
                    }
                  }}
                  placeholder={clarification.inputPlaceholder}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
                <Button
                  type="button"
                  onClick={() => answerClarification(clarificationAnswer)}
                  disabled={clarificationAnswer.trim().length < 2 || isBusy}
                  className="h-11 rounded-xl px-5"
                >
                  {status === "searching" ? <LoaderCircle className="animate-spin" /> : <Search />}
                  تابع البحث
                </Button>
              </div>
              <p className="text-[0.68rem] leading-5 text-muted-foreground">لن يبدأ البحث النهائي قبل فهم الموقع المقصود، لتجنب نتائج غير دقيقة.</p>
            </div>
          </div>
        </section>
      ) : null}

      {status !== "idle" && !payload && !clarification ? (
        <section className="mx-auto max-w-5xl space-y-3 px-4 py-10" aria-live="polite">
          <p className="text-center text-sm font-medium text-primary">
            {status === "searching" ? "نحلّل طلبك ونطابقه مع البيانات المنشورة…" : "نحدّث النتائج وفق اختيارك…"}
          </p>
          {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl border border-border bg-card" />)}
        </section>
      ) : null}

      {payload ? (
        <section ref={resultsRef} id="agarly-results" className="mx-auto max-w-6xl scroll-mt-4 px-3 py-7 sm:px-5 md:py-10">
          <div className="rounded-2xl border border-border bg-card shadow-[0_12px_40px_rgba(15,39,68,0.06)]">
            <div className="border-b border-border px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-[0.65rem] font-semibold tracking-[0.14em] text-brand-gold uppercase">نتيجة موثقة من السوق</p><h2 className="mt-1 text-lg font-bold text-primary">{resultSummary(payload.results)}</h2></div>
                <div className="flex flex-wrap items-center gap-2">
                  <AgarlyFilterEditor filters={payload.filters} busy={isBusy} onApply={applyFilters} />
                  {payload.results.mapListings.length ? (
                    <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
                      <button type="button" onClick={() => setView("list")} className={cn("flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-semibold", view === "list" && "bg-card text-primary shadow-sm")}><List className="size-3.5" />القائمة</button>
                      <button type="button" onClick={() => setView("map")} className={cn("flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-semibold", view === "map" && "bg-card text-primary shadow-sm")}><Map className="size-3.5" />الخريطة</button>
                      <button type="button" onClick={() => setView("split")} className={cn("hidden h-8 items-center gap-1 rounded-md px-2.5 text-xs font-semibold lg:flex", view === "split" && "bg-card text-primary shadow-sm")}><Columns2 className="size-3.5" />مشترك</button>
                    </div>
                  ) : null}
                </div>
              </div>
              {chips.length ? (
                <div className="mt-4 flex flex-wrap gap-2" aria-label="الفلاتر المستخرجة">
                  {chips.map((chip) => (
                    <button key={chip.id} type="button" disabled={isBusy} onClick={() => void applyFilters(chip.next)} className="group inline-flex h-8 items-center gap-1.5 rounded-full border border-brand-gold/30 bg-[#fbf7f0] px-2.5 text-xs font-medium text-primary transition hover:border-brand-gold hover:bg-[#f6ecde] disabled:opacity-50" title="إزالة هذا الفلتر وتحديث النتائج دون استهلاك بحث ذكي">
                      <Check className="size-3 text-brand-gold" />{chip.label}<X className="size-3 text-muted-foreground group-hover:text-primary" />
                    </button>
                  ))}
                  {status === "refining" ? <span className="inline-flex items-center gap-1 px-2 text-xs text-muted-foreground"><LoaderCircle className="size-3.5 animate-spin" />تحديث</span> : null}
                </div>
              ) : null}
              <p className="mt-3 text-[0.68rem] text-muted-foreground">اضغط أي فلتر لإزالته وتحديث النتائج محليًا دون استهلاك عملية ذكية جديدة.</p>
            </div>

            {view === "map" && payload.results.mapListings.length ? (
              <BrowseListingsMapLazy listings={payload.results.mapListings} listHref="#agarly-results" className="overflow-hidden rounded-b-2xl" />
            ) : view === "split" && payload.results.mapListings.length ? (
              <>
                <div className="divide-y divide-border lg:hidden">
                  {payload.results.listings.map((listing) => (
                    <ListingResultRow key={listing.id} item={{ id: listing.id, href: `/properties/${listing.id}`, title: listing.title, price: listing.price, area: listing.area, type: listing.type, deal: listing.deal, image: listing.image, listingNumber: listing.listingNumber, rooms: listing.rooms }} className="bg-card" />
                  ))}
                </div>
                <div className="hidden min-h-[32rem] grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] divide-x divide-x-reverse divide-border lg:grid">
                  <div className="max-h-[min(68vh,38rem)] divide-y divide-border overflow-y-auto">
                    {payload.results.listings.map((listing) => (
                      <ListingResultRow key={listing.id} item={{ id: listing.id, href: `/properties/${listing.id}`, title: listing.title, price: listing.price, area: listing.area, type: listing.type, deal: listing.deal, image: listing.image, listingNumber: listing.listingNumber, rooms: listing.rooms }} className="bg-card" />
                    ))}
                  </div>
                  <BrowseListingsMapLazy listings={payload.results.mapListings} listHref="#agarly-results" className="overflow-hidden rounded-bl-2xl" />
                </div>
              </>
            ) : (
              <div className="divide-y divide-border">
                {payload.results.listings.map((listing) => (
                  <ListingResultRow key={listing.id} item={{ id: listing.id, href: `/properties/${listing.id}`, title: listing.title, price: listing.price, area: listing.area, type: listing.type, deal: listing.deal, image: listing.image, listingNumber: listing.listingNumber, rooms: listing.rooms }} className="bg-card" />
                ))}
              </div>
            )}

            {!payload.results.listings.length && !payload.results.projects.length && !payload.results.agencies.length ? (
              <div className="px-5 py-14 text-center"><Search className="mx-auto size-7 text-brand-gold" /><h3 className="mt-3 font-bold text-primary">لا توجد نتائج مطابقة الآن</h3><p className="mt-2 text-sm text-muted-foreground">أزل أحد الفلاتر أعلاه أو اكتب وصفًا أقل تقييدًا.</p></div>
            ) : null}
          </div>

          {payload.results.projects.length ? (
            <div className="mt-6"><div className="mb-3 flex items-end justify-between"><div><p className="text-[0.65rem] font-semibold text-brand-gold">مشاريع معتمدة</p><h2 className="mt-1 text-lg font-bold text-primary">مشاريع تطابق طلبك</h2></div><Link href="/projects" className="text-xs font-semibold text-primary">عرض الدليل</Link></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{payload.results.projects.map((project) => <Link key={project.id} href={`/projects/${project.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><div className="relative h-32 bg-muted"><ListingImage src={project.imageUrl ?? "/placeholder-listing.svg"} alt={project.name} fill className="object-cover transition duration-300 group-hover:scale-[1.02]" /></div><div className="p-4"><h3 className="font-bold text-primary">{project.name}</h3><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{project.locationLabel}</p>{project.summary ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{project.summary}</p> : null}</div></Link>)}</div>
            </div>
          ) : null}

          {payload.results.agencies.length ? (
            <div className="mt-6"><div className="mb-3 flex items-end justify-between"><div><p className="text-[0.65rem] font-semibold text-brand-gold">وكالات موثقة</p><h2 className="mt-1 text-lg font-bold text-primary">مكاتب عقارية معتمدة</h2></div><Link href="/agencies" className="text-xs font-semibold text-primary">عرض الدليل</Link></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{payload.results.agencies.map((agency) => <Link key={agency.id} href={`/agencies/${agency.slug}`} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-brand-gold/40 hover:shadow-md"><div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/5">{agency.logoUrl ? <ListingImage src={agency.logoUrl} alt={agency.name} fill className="object-cover" /> : <Building2 className="size-5 text-primary" />}</div><div className="min-w-0 flex-1"><h3 className="truncate font-bold text-primary">{agency.name}</h3><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{agency.locationLabel}</p><Badge variant="outline" className="mt-2 rounded-full text-[0.6rem]">وكالة معتمدة</Badge></div><ChevronLeft className="size-4 text-muted-foreground" /></Link>)}</div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="mx-auto max-w-5xl px-4 py-10 text-center">
        <p className="text-[0.68rem] leading-5 text-muted-foreground">Agarly يفسّر طلبك فقط؛ جميع النتائج تُقرأ من إعلانات ومشاريع ووكالات منشورة ومعتمدة في AGARATİ. راجع تفاصيل العقار قبل اتخاذ القرار.</p>
      </section>
    </main>
  )
}

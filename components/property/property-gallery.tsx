"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react"

import { ListingImage } from "@/components/property/listing-image"
import { SITE_NAME_AR, SITE_NAME_LATIN } from "@/lib/constants"
import { cn } from "@/lib/utils"

const SWIPE_THRESHOLD = 50

type Props = {
  images: string[]
  title: string
  ownerName?: string | null
}

function Watermark({
  ownerName,
  variant = "corner",
}: {
  ownerName?: string | null
  variant?: "corner" | "diagonal"
}) {
  const owner = ownerName?.trim() || "معلن"
  if (variant === "diagonal") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <div className="-rotate-[28deg] select-none text-center opacity-[0.22]">
          <p className="text-2xl font-bold tracking-wide text-white drop-shadow sm:text-4xl">
            {SITE_NAME_AR}
          </p>
          <p className="mt-1 text-sm font-medium text-white/90 sm:text-base">
            {SITE_NAME_LATIN} · {owner}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-3 pb-2.5 pt-10"
    >
      <p className="text-[0.7rem] font-semibold text-white/95">
        {SITE_NAME_AR}
        <span className="mx-1.5 opacity-50">·</span>
        <span className="font-normal text-white/85">{owner}</span>
      </p>
    </div>
  )
}

export function PropertyGallery({ images, title, ownerName }: Props) {
  const gallery = images.filter(Boolean)
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)

  const count = gallery.length
  const current = gallery[Math.min(index, Math.max(count - 1, 0))] ?? ""

  const go = useCallback(
    (dir: -1 | 1) => {
      if (count < 2) return
      setIndex((i) => (i + dir + count) % count)
    },
    [count]
  )

  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || count < 2) return
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y
      touchStartRef.current = null
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
        go(dx > 0 ? 1 : -1)
      }
    },
    [count, go]
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
      if (e.key === "ArrowLeft") go(1)
      if (e.key === "ArrowRight") go(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, go])

  if (!current) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-muted text-sm text-muted-foreground md:aspect-[16/10]">
        لا صورة
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2 bg-card">
        <button
          type="button"
          onClick={() => setOpen(true)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="group relative block w-full cursor-zoom-in overflow-hidden bg-muted aspect-[4/3] md:aspect-[16/10]"
          aria-label="تكبير الصورة"
        >
          <ListingImage
            src={current}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="100vw"
            priority
          />
          <Watermark ownerName={ownerName} />
          <span className="absolute bottom-3 start-1/2 z-[1] -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-0.5 text-[0.7rem] text-white">
            {index + 1} / {count}
          </span>
          <span className="absolute end-3 top-3 z-[1] inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[0.65rem] text-white opacity-90 backdrop-blur-sm transition group-hover:bg-black/65">
            <Expand className="size-3" />
            تكبير
          </span>
        </button>

        {count > 1 ? (
          <div className="flex gap-2 overflow-x-auto px-3 pb-3">
            {gallery.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => {
                  setIndex(i)
                }}
                onDoubleClick={() => {
                  setIndex(i)
                  setOpen(true)
                }}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-md ring-offset-background transition sm:size-20",
                  i === index
                    ? "ring-2 ring-primary"
                    : "opacity-80 ring-1 ring-border hover:opacity-100"
                )}
                aria-label={`صورة ${i + 1}`}
              >
                <ListingImage
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="معرض الصور"
          className="fixed inset-0 z-[80] flex flex-col bg-black/92 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between gap-3 px-3 py-3 text-white sm:px-5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title}</p>
              <p className="text-[0.7rem] text-white/65">
                {index + 1} من {count}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="إغلاق"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-10">
            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute start-2 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:start-4"
                  aria-label="السابق"
                >
                  <ChevronRight className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute end-2 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:end-4"
                  aria-label="التالي"
                >
                  <ChevronLeft className="size-6" />
                </button>
              </>
            ) : null}

            <div
              className="relative h-full max-h-[78vh] w-full max-w-5xl"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div className="relative mx-auto h-full w-full overflow-hidden rounded-lg">
                <ListingImage
                  src={current}
                  alt={title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
                <Watermark ownerName={ownerName} variant="diagonal" />
                <Watermark ownerName={ownerName} variant="corner" />
              </div>
            </div>
          </div>

          {count > 1 ? (
            <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
              {gallery.map((src, i) => (
                <button
                  key={`lb-${src}-${i}`}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn(
                    "relative size-14 shrink-0 overflow-hidden rounded-md",
                    i === index
                      ? "ring-2 ring-[color:var(--brand-gold)]"
                      : "opacity-60 hover:opacity-100"
                  )}
                >
                  <ListingImage
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

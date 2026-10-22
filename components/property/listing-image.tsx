"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

const PLACEHOLDER = "/placeholder-listing.svg"

type Props = {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
}

/**
 * Listing photos via native <img> — avoids Next optimizer failures
 * (local Supabase, Unsplash blocks, SVG quirks) so gallery/cards stay visible.
 */
export function ListingImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  priority,
}: Props) {
  const resolved = src || PLACEHOLDER
  const [current, setCurrent] = useState(resolved)
  const [dead, setDead] = useState(false)
  const [prevSrc, setPrevSrc] = useState(src)

  if (src !== prevSrc) {
    setPrevSrc(src)
    setCurrent(resolved)
    setDead(false)
  }

  if (dead) {
    return (
      <span
        className={cn(
          "flex items-center justify-center bg-muted text-xs text-muted-foreground",
          fill && "absolute inset-0 size-full",
          className
        )}
      >
        لا تتوفر صورة
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- listing CDN/storage needs raw img
    <img
      src={current}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn(fill && "absolute inset-0 size-full", className)}
      onError={() => {
        if (current !== PLACEHOLDER) {
          setCurrent(PLACEHOLDER)
          return
        }
        setDead(true)
      }}
    />
  )
}

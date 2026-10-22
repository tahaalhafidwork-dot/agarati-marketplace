"use client"

import { useState } from "react"
import { Check, Share2 } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  text?: string
  /** Absolute or path URL; defaults to current page */
  url?: string
  className?: string
}

export function ListingShareButton({ title, text, url, className }: Props) {
  const [copied, setCopied] = useState(false)

  function copyWithTextarea(value: string) {
    const el = document.createElement("textarea")
    el.value = value
    el.setAttribute("readonly", "")
    el.style.position = "fixed"
    el.style.inset = "0"
    el.style.opacity = "0"
    document.body.appendChild(el)
    el.focus()
    el.select()
    const ok = document.execCommand("copy")
    el.remove()
    return ok
  }

  async function copyLink(absolute: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(absolute)
        return true
      }
    } catch {
      /* fall through to the textarea copy */
    }
    try {
      return copyWithTextarea(absolute)
    } catch {
      window.prompt("انسخ رابط الإعلان:", absolute)
      return false
    }
  }

  async function share() {
    const href =
      url ??
      (typeof window !== "undefined" ? window.location.href : "")
    const absolute =
      href.startsWith("http") || typeof window === "undefined"
        ? href
        : `${window.location.origin}${href.startsWith("/") ? href : `/${href}`}`

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title,
          text: text || title,
          url: absolute,
        })
        return
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
    }

    const copied = await copyLink(absolute)
    if (!copied) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      aria-label={copied ? "تم نسخ الرابط" : "مشاركة الإعلان"}
      title={copied ? "تم نسخ الرابط" : "مشاركة"}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "size-9 rounded-full text-primary-foreground/85 hover:bg-white/10 hover:text-[#e8d5b5]",
        className
      )}
    >
      {copied ? (
        <Check className="size-4 text-[color:var(--brand-gold)]" strokeWidth={1.8} />
      ) : (
        <Share2 className="size-4" strokeWidth={1.6} />
      )}
    </button>
  )
}

"use client"

import { useEffect, useId, useRef, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { MessageSquare, Send, X } from "lucide-react"

import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  listingTitle?: string
  content: string
  onContentChange: (value: string) => void
  error?: string | null
  pending?: boolean
  onSubmit: () => void
}

const emptySubscribe = () => () => {}

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

/** Compact in-app message composer — portaled above bottom nav / contact bar. */
export function ListingMessageSheet({
  open,
  onOpenChange,
  listingTitle,
  content,
  onContentChange,
  error,
  pending = false,
  onSubmit,
}: Props) {
  const titleId = useId()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mounted = useIsClient()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const t = window.setTimeout(() => textareaRef.current?.focus(), 50)
    return () => {
      document.body.style.overflow = prev
      window.clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#0F2744]/45 backdrop-blur-[2px]"
        aria-label="إغلاق"
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-[1] flex w-full max-w-md flex-col",
          "max-h-[min(28rem,85dvh)]",
          "rounded-t-2xl border border-[color:var(--brand-gold)]/40 bg-[#fffdf9]",
          "shadow-[0_-12px_40px_rgba(15,39,68,0.28)]",
          "sm:rounded-2xl sm:shadow-[0_20px_50px_rgba(15,39,68,0.22)]"
        )}
      >
        <div
          className="h-0.5 w-full shrink-0 bg-[linear-gradient(90deg,transparent,#B8956C_30%,#B8956C_70%,transparent)]"
          aria-hidden
        />
        <div
          className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-[#0F2744]/12 sm:hidden"
          aria-hidden
        />

        <header className="flex shrink-0 items-start gap-3 px-4 pb-3 pt-2.5">
          <div className="min-w-0 flex-1">
            <p
              id={titleId}
              className="flex items-center gap-2 text-[0.95rem] font-semibold text-[#0F2744]"
            >
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0F2744] text-[color:var(--brand-gold)]">
                <MessageSquare className="size-3.5" strokeWidth={1.75} />
              </span>
              رسالة للمعلن
            </p>
            <p className="mt-1 line-clamp-2 pe-2 text-[0.7rem] leading-5 text-[#6B6560]">
              {listingTitle
                ? `بخصوص: ${listingTitle}`
                : "تصل الرسالة إلى صندوق مراسلات المعلن"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0F2744]/8 text-[#0F2744]/65 transition hover:bg-[#0F2744]/12 hover:text-[#0F2744]"
            aria-label="إغلاق"
          >
            <X className="size-3.5" />
          </button>
        </header>

        <div className="h-px shrink-0 bg-[color:var(--brand-gold)]/20" />

        <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-4 py-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="اكتب استفسارك باختصار…"
            className={cn(
              "min-h-[5.5rem] max-h-[10rem] w-full flex-none resize-none overflow-y-auto",
              "rounded-xl border border-[color:var(--brand-gold)]/30 bg-white px-3.5 py-2.5",
              "text-sm leading-6 text-[#0F2744] outline-none transition",
              "placeholder:text-[#6B6560]/55",
              "focus:border-[color:var(--brand-gold)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/20"
            )}
          />
          {error ? (
            <p className="text-xs font-medium text-destructive">{error}</p>
          ) : (
            <p className="text-[0.65rem] leading-4 text-[#6B6560]">
              المحادثة داخل أغاراتي — بدون مشاركة رقمك إلا إذا رغبت.
            </p>
          )}
        </div>

        <footer
          className={cn(
            "flex shrink-0 gap-2 border-t border-[color:var(--brand-gold)]/15 bg-[#fffdf9] px-4 pt-3",
            "pb-[max(0.85rem,env(safe-area-inset-bottom))]"
          )}
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={pending}
            className="h-11 flex-1 rounded-xl border border-[#0F2744]/12 bg-white text-sm font-medium text-[#0F2744] transition hover:bg-[#faf6ef] disabled:opacity-60"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={pending || !content.trim()}
            className={cn(
              "inline-flex h-11 flex-[1.35] items-center justify-center gap-1.5 rounded-xl",
              "bg-[#0F2744] text-sm font-medium text-[#f8f1e6]",
              "shadow-[0_6px_16px_rgba(15,39,68,0.22)] transition hover:brightness-110",
              "disabled:opacity-50"
            )}
          >
            <Send className="size-3.5 text-[color:var(--brand-gold)]" />
            {pending ? "جاري الإرسال…" : "إرسال"}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  )
}

"use client"

import { useState, useTransition, type MouseEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Mail } from "lucide-react"

import { sendMessageAction } from "@/lib/actions/listings"
import { ListingMessageSheet } from "@/components/property/listing-message-sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  listingId: string
  listingTitle?: string
  isDemo?: boolean
  /** dock = contact bar primary; plain = outline */
  variant?: "dock" | "plain"
  className?: string
  enabled?: boolean
}

export function ListingMessageButton({
  listingId,
  listingTitle,
  isDemo = false,
  variant = "plain",
  className,
  enabled = true,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (!enabled) return null

  const openComposer = (e?: MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (isDemo) {
      window.alert(
        "المراسلة متاحة للإعلانات المنشورة فعلياً بعد موافقة الإدارة."
      )
      return
    }
    setError(null)
    setOpen(true)
  }

  const submit = () => {
    const trimmed = content.trim()
    if (!trimmed) {
      setError("اكتب رسالتك أولاً.")
      return
    }
    startTransition(async () => {
      const fd = new FormData()
      fd.set("listingId", listingId)
      fd.set("content", trimmed)
      const result = await sendMessageAction({}, fd)
      if (result.code === "UNAUTHORIZED") {
        setOpen(false)
        router.push(
          `/login?next=${encodeURIComponent(pathname || `/properties/${listingId}`)}`
        )
        return
      }
      if (result.error) {
        setError(result.error)
        return
      }
      setContent("")
      setOpen(false)
      router.push(`/dashboard/messages/${listingId}`)
      router.refresh()
    })
  }

  const trigger =
    variant === "dock" ? (
      <button
        type="button"
        onClick={openComposer}
        className={cn(
          "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition",
          "hover:bg-primary/90 active:scale-[0.99]",
          className
        )}
      >
        <Mail className="size-4 shrink-0" strokeWidth={2} />
        مراسلة
      </button>
    ) : (
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="مراسلة عبر التطبيق"
        className={cn("size-11 rounded-xl", className)}
        onClick={openComposer}
      >
        <Mail className="size-4" />
      </Button>
    )

  return (
    <>
      {trigger}
      <ListingMessageSheet
        open={open}
        onOpenChange={setOpen}
        listingTitle={listingTitle}
        content={content}
        onContentChange={(value) => {
          setContent(value)
          if (error) setError(null)
        }}
        error={error}
        pending={pending}
        onSubmit={submit}
      />
    </>
  )
}

"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Send } from "lucide-react"

import { sendMessageAction } from "@/lib/actions/listings"
import { Button } from "@/components/ui/button"

export function MessageComposer({ listingId }: { listingId: string }) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-2 border-t border-border bg-card p-3">
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          if (error) setError(null)
        }}
        rows={2}
        maxLength={2000}
        placeholder="اكتب ردّك…"
        className="w-full resize-none rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <Button
        type="button"
        className="h-10 w-full gap-1.5 sm:w-auto"
        disabled={pending || !content.trim()}
        onClick={() => {
          const trimmed = content.trim()
          if (!trimmed) return
          startTransition(async () => {
            const fd = new FormData()
            fd.set("listingId", listingId)
            fd.set("content", trimmed)
            const result = await sendMessageAction({}, fd)
            if (result.error) {
              setError(result.error)
              return
            }
            setContent("")
            router.refresh()
          })
        }}
      >
        <Send className="size-3.5" />
        إرسال
      </Button>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { ArrowRight, ClipboardList, Send } from "lucide-react"

import {
  getMessagesAction,
  sendMessageAction,
  type ThreadMessageDto,
} from "@/lib/actions/listings"
import {
  getPropertyRequestMessagesAction,
  sendPropertyRequestMessageAction,
} from "@/lib/actions/property-requests"
import { Badge } from "@/components/ui/badge"
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client"
import {
  subscribeListingThread,
  subscribeRequestThread,
} from "@/infrastructure/realtime/supabase-channel"
import { cn } from "@/lib/utils"

type ListingProps = {
  mode: "listing"
  listingId: string
  listingTitle: string
  isOwner: boolean
}

type RequestProps = {
  mode: "request"
  requestId: string
  requestTitle: string
  peerId: string
  peerName: string
  disabled?: boolean
}

type Common = {
  currentUserId: string
  currentUserName: string
  initialMessages: ThreadMessageDto[]
}

export function MessageThreadLive(props: (ListingProps | RequestProps) & Common) {
  const {
    currentUserId,
    currentUserName,
    initialMessages,
  } = props

  const [messagesOverride, setMessagesOverride] = useState<
    ThreadMessageDto[] | null
  >(null)
  const [seenInitial, setSeenInitial] = useState(initialMessages)
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(false)

  if (seenInitial !== initialMessages) {
    setSeenInitial(initialMessages)
    setMessagesOverride(null)
  }

  const messages = messagesOverride ?? initialMessages

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const isRequest = props.mode === "request"
  const title = isRequest ? props.requestTitle : props.listingTitle
  const hasInbound = messages.some((m) => m.fromId !== currentUserId)
  const canCompose = isRequest
    ? !props.disabled
    : !props.isOwner || hasInbound

  const listingId = props.mode === "listing" ? props.listingId : ""
  const requestId = props.mode === "request" ? props.requestId : ""
  const peerId = props.mode === "request" ? props.peerId : ""

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    })
  }, [])

  const refresh = useCallback(async () => {
    try {
      const next = isRequest
        ? await getPropertyRequestMessagesAction(requestId, peerId)
        : await getMessagesAction(listingId)
      if (!mountedRef.current) return
      setMessagesOverride((prev) => {
        const base = prev ?? initialMessages
        if (
          base.length === next.length &&
          base[base.length - 1]?.id === next[next.length - 1]?.id
        ) {
          return prev
        }
        return next
      })
    } catch {
      /* keep */
    }
  }, [isRequest, listingId, requestId, peerId, initialMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages.length, scrollToBottom])

  useEffect(() => {
    const kick = window.setTimeout(() => void refresh(), 0)
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh()
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", onVisible)

    let pollTimer: number | null = window.setInterval(
      () => void refresh(),
      3_000
    )
    let unsubRealtime: (() => void) | undefined

    const startPolling = () => {
      if (pollTimer != null) return
      pollTimer = window.setInterval(() => void refresh(), 3_000)
    }
    const stopFastPolling = () => {
      if (pollTimer != null) {
        window.clearInterval(pollTimer)
        pollTimer = null
      }
    }

    if (isSupabaseConfigured()) {
      try {
        const client = createClient()
        if (isRequest) {
          unsubRealtime = subscribeRequestThread(client, requestId, {
            onChange: () => void refresh(),
            onError: startPolling,
          })
        } else {
          unsubRealtime = subscribeListingThread(client, listingId, {
            onChange: () => void refresh(),
            onError: startPolling,
          })
        }
        window.setTimeout(() => {
          stopFastPolling()
          pollTimer = window.setInterval(() => void refresh(), 15_000)
        }, 2_000)
      } catch {
        /* keep 3s polling */
      }
    }

    return () => {
      window.clearTimeout(kick)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", onVisible)
      stopFastPolling()
      unsubRealtime?.()
    }
  }, [refresh, isRequest, listingId, requestId])

  const submit = () => {
    const trimmed = content.trim()
    if (!trimmed || pending) return

    const optimisticId = `local-${Date.now()}`
    const optimistic: ThreadMessageDto = {
      id: optimisticId,
      content: trimmed,
      fromId: currentUserId,
      fromName: currentUserName,
      createdAt: new Date().toISOString(),
    }
    setMessagesOverride((prev) => [...(prev ?? initialMessages), optimistic])
    setContent("")
    setError(null)

    startTransition(async () => {
      const fd = new FormData()
      fd.set("content", trimmed)
      let result: { error?: string }
      if (props.mode === "request") {
        fd.set("requestId", props.requestId)
        fd.set("peerId", props.peerId)
        result = await sendPropertyRequestMessageAction({}, fd)
      } else {
        fd.set("listingId", props.listingId)
        result = await sendMessageAction({}, fd)
      }
      if (result.error) {
        setMessagesOverride((prev) =>
          (prev ?? initialMessages).filter((m) => m.id !== optimisticId)
        )
        setContent(trimmed)
        setError(result.error)
        return
      }
      await refresh()
    })
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-3 py-3">
        <Link
          href="/dashboard/messages"
          className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="الرجوع"
        >
          <ArrowRight className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {isRequest ? (
              <Badge className="rounded-md bg-[color:var(--brand-gold)]/20 text-[0.65rem] text-[#0F2744]">
                <ClipboardList className="me-1 size-3" />
                طلب عقار
              </Badge>
            ) : null}
            <p className="truncate text-sm font-semibold">{title}</p>
          </div>
          {isRequest ? (
            <p className="mt-0.5 truncate text-[0.7rem] text-muted-foreground">
              مع {props.peerName} ·{" "}
              <Link
                href={`/dashboard/property-requests/${props.requestId}`}
                className="text-primary hover:underline"
              >
                عرض الطلب
              </Link>
            </p>
          ) : (
            <Link
              href={`/properties/${props.listingId}`}
              className="text-[0.7rem] text-primary hover:underline"
            >
              عرض الإعلان
            </Link>
          )}
        </div>
      </div>

      <div className="flex max-h-[min(60vh,28rem)] flex-col gap-2.5 overflow-y-auto bg-[linear-gradient(180deg,#f7f3ec_0%,#fff_40%)] px-3 py-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {isRequest
              ? "ابدأ المحادثة بعرض مناسب أو سؤال توضيحي."
              : "ابدأ المحادثة برسالة قصيرة للمعلن."}
          </p>
        ) : (
          messages.map((msg) => {
            const mine = msg.fromId === currentUserId
            return (
              <div
                key={msg.id}
                className={cn("flex", mine ? "justify-start" : "justify-end")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm",
                    mine
                      ? "rounded-se-md bg-primary text-primary-foreground"
                      : "rounded-ss-md border border-border bg-card text-foreground",
                    msg.id.startsWith("local-") && "opacity-80"
                  )}
                >
                  {!mine ? (
                    <p className="mb-1 text-[0.65rem] font-medium text-muted-foreground">
                      {msg.fromName}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-[0.6rem]",
                      mine
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {new Date(msg.createdAt).toLocaleString("ar-IQ-u-nu-latn")}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {canCompose ? (
        <div className="space-y-2 border-t border-border bg-card p-3">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              if (error) setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            rows={2}
            maxLength={2000}
            placeholder="اكتب ردّك…"
            className="w-full resize-none rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <button
            type="button"
            disabled={pending || !content.trim()}
            onClick={submit}
            className={cn(
              "inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground sm:w-auto",
              "disabled:opacity-50"
            )}
          >
            <Send className="size-3.5" />
            {pending ? "جاري الإرسال…" : "إرسال"}
          </button>
        </div>
      ) : (
        <div className="border-t border-border px-3 py-3 text-xs text-muted-foreground">
          {isRequest
            ? "هذا الطلب مغلق — لا يمكن إرسال رسائل جديدة."
            : "بانتظار رسالة من مهتم — ستظهر هنا تلقائياً للرد مباشرة."}
        </div>
      )}
    </div>
  )
}

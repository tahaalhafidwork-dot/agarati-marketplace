"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { getUnreadMessagesCountAction } from "@/lib/actions/listings"
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client"
import { subscribeUserMessageInbox } from "@/infrastructure/realtime/supabase-channel"

const UnreadCtx = createContext<number | null>(null)

const POLL_MS = 30_000

/** Live unread count — Realtime primary, silent polling fallback. */
export function UnreadMessagesProvider({
  initialCount = 0,
  enabled = false,
  children,
}: {
  initialCount?: number
  enabled?: boolean
  children: ReactNode
}) {
  /** null = trust server `initialCount`; number = client-refreshed value */
  const [liveCount, setLiveCount] = useState<number | null>(null)
  const [seenInitial, setSeenInitial] = useState(initialCount)
  const usePolling = useRef(true)
  const mountedRef = useRef(false)

  if (seenInitial !== initialCount) {
    setSeenInitial(initialCount)
    setLiveCount(null)
  }

  const displayCount = liveCount ?? initialCount

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const refresh = useCallback(async () => {
    if (!enabled) return
    try {
      const result = await getUnreadMessagesCountAction()
      if (!mountedRef.current) return
      setLiveCount(result.count ?? 0)
    } catch {
      /* keep last known */
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const kick = window.setTimeout(() => void refresh(), 0)

    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh()
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", onVisible)

    let pollTimer: number | null = null
    const startPolling = () => {
      usePolling.current = true
      if (pollTimer != null) return
      pollTimer = window.setInterval(() => void refresh(), POLL_MS)
    }
    const stopPolling = () => {
      usePolling.current = false
      if (pollTimer != null) {
        window.clearInterval(pollTimer)
        pollTimer = null
      }
    }

    startPolling()

    let unsubRealtime: (() => void) | undefined
    let cancelled = false
    if (isSupabaseConfigured()) {
      try {
        const client = createClient()
        void client.auth.getUser().then(({ data }) => {
          if (cancelled || !mountedRef.current) return
          const uid = data.user?.id
          if (!uid) return
          unsubRealtime = subscribeUserMessageInbox(client, uid, {
            onChange: () => void refresh(),
            onError: () => {
              startPolling()
            },
          })
          window.setTimeout(() => {
            if (cancelled || !mountedRef.current) return
            if (!usePolling.current) return
            stopPolling()
            pollTimer = window.setInterval(() => void refresh(), POLL_MS * 2)
          }, 2_000)
        })
      } catch {
        startPolling()
      }
    }

    return () => {
      cancelled = true
      window.clearTimeout(kick)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", onVisible)
      stopPolling()
      unsubRealtime?.()
    }
  }, [enabled, refresh])

  return (
    <UnreadCtx.Provider value={enabled ? displayCount : 0}>
      {children}
    </UnreadCtx.Provider>
  )
}

export function useUnreadMessagesCount(fallback = 0) {
  const ctx = useContext(UnreadCtx)
  return ctx === null ? fallback : ctx
}

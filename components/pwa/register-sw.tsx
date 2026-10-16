"use client"

import { useEffect } from "react"

/** Registers `/sw.js` in production builds only. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
      } catch (err) {
        console.warn("[pwa] service worker registration failed", err)
      }
    }

    void register()
  }, [])

  return null
}

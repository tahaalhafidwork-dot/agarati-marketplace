/** Load Leaflet from CDN to avoid Next/Turbopack CSS/ESM issues. */

export type LeafletNamespace = typeof import("leaflet")

declare global {
  interface Window {
    L?: LeafletNamespace
  }
}

let leafletPromise: Promise<LeafletNamespace> | null = null

function loadCss(href: string) {
  if (typeof document === "undefined") return
  if (document.querySelector(`link[data-agarati-leaflet="1"]`)) return
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = href
  link.setAttribute("data-agarati-leaflet", "1")
  document.head.appendChild(link)
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("no document"))
      return
    }
    const existing = document.querySelector(
      `script[data-agarati-leaflet="1"]`
    ) as HTMLScriptElement | null
    if (existing) {
      if (window.L) {
        resolve()
        return
      }
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () =>
        reject(new Error("Leaflet script failed"))
      )
      return
    }
    const script = document.createElement("script")
    script.src = src
    script.async = true
    script.setAttribute("data-agarati-leaflet", "1")
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Leaflet script failed"))
    document.head.appendChild(script)
  })
}

export async function ensureLeaflet(): Promise<LeafletNamespace> {
  if (typeof window !== "undefined" && window.L) {
    return window.L
  }
  if (!leafletPromise) {
    leafletPromise = (async () => {
      loadCss("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css")
      await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js")
      if (!window.L) throw new Error("Leaflet global missing after load")
      // Fix default icon paths when needed (we use circle markers mostly)
      return window.L
    })()
  }
  return leafletPromise
}

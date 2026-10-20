const STORAGE_KEY = "agarati:favorites:v1"

export type LocalFavoriteEntry = {
  id: string
  savedAt: string
}

function readRaw(): LocalFavoriteEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is LocalFavoriteEntry =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as LocalFavoriteEntry).id === "string"
    )
  } catch {
    return []
  }
}

function writeRaw(entries: LocalFavoriteEntry[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  window.dispatchEvent(
    new CustomEvent("agarati:favorites-changed", {
      detail: { ids: entries.map((e) => e.id) },
    })
  )
}

export function getLocalFavoriteIds(): string[] {
  return readRaw().map((e) => e.id)
}

export function isLocalFavorite(listingId: string): boolean {
  return readRaw().some((e) => e.id === listingId)
}

export function toggleLocalFavorite(listingId: string): boolean {
  const current = readRaw()
  const exists = current.some((e) => e.id === listingId)
  const next = exists
    ? current.filter((e) => e.id !== listingId)
    : [...current, { id: listingId, savedAt: new Date().toISOString() }]
  writeRaw(next)
  return !exists
}

export function removeLocalFavorite(listingId: string) {
  writeRaw(readRaw().filter((e) => e.id !== listingId))
}

export function clearLocalFavorites() {
  writeRaw([])
}

export function subscribeLocalFavorites(
  listener: (ids: string[]) => void
): () => void {
  if (typeof window === "undefined") return () => {}
  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent<{ ids: string[] }>).detail
    listener(detail?.ids ?? getLocalFavoriteIds())
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener(getLocalFavoriteIds())
  }
  window.addEventListener("agarati:favorites-changed", onCustom)
  window.addEventListener("storage", onStorage)
  return () => {
    window.removeEventListener("agarati:favorites-changed", onCustom)
    window.removeEventListener("storage", onStorage)
  }
}

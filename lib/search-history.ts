export const SEARCH_HISTORY_KEY = "agarati:search-history"

export function clearLocalSearchHistory() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(SEARCH_HISTORY_KEY)
  } catch {
    /* ignore */
  }
}

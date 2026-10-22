/** Normalize /properties?... → stable uniqueness key (ignore map view). */
export function savedSearchQueryKey(href: string): string {
  try {
    const url = new URL(href, "https://agarati.local")
    url.searchParams.delete("view")
    return url.searchParams.toString()
  } catch {
    return href.replace(/^\//, "").replace(/^properties\??/, "")
  }
}

/** Helpers for listing / storage media URLs. */

export function isAppStorageImage(url: string): boolean {
  if (!url) return false
  return (
    url.includes("/storage/v1/object/") ||
    url.includes("127.0.0.1") ||
    url.includes("localhost") ||
    url.startsWith("/")
  )
}

/** Encode each path segment so public storage URLs stay valid. */
export function encodeStoragePath(storagePath: string): string {
  return storagePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")
}

import { encodeStoragePath } from "@/lib/media"

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  )
}

export function getSupabasePublicUrl(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || null
}

/** Public URL for a storage object in the listing-images bucket. */
export function listingImagePublicUrl(storagePath: string): string {
  const base = getSupabasePublicUrl()
  if (!base) return storagePath
  const path = encodeStoragePath(storagePath.replace(/^\/+/, ""))
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/listing-images/${path}`
}

/** Public URL for avatar objects (stored under listing-images/{userId}/avatar/…). */
export function avatarPublicUrl(storagePath: string): string {
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath
  }
  return listingImagePublicUrl(storagePath)
}

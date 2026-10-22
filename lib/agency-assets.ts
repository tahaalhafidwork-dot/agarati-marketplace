import { createServiceClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { avatarPublicUrl } from "@/lib/supabase/config"

const MAX_LOGO_BYTES = 3 * 1024 * 1024

export function normalizeAgencySocialUrl(
  raw: string | null | undefined
): string | null {
  const value = (raw ?? "").trim()
  if (!value) return null
  try {
    const withProtocol = /^https?:\/\//i.test(value)
      ? value
      : `https://${value}`
    const url = new URL(withProtocol)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return url.toString()
  } catch {
    return null
  }
}

/** Upload agency logo to listing-images/{userId}/agency-logo/… */
export async function uploadAgencyLogoFile(
  userId: string,
  file: File,
  opts?: { preferServiceRole?: boolean }
): Promise<{ url: string } | { error: string }> {
  if (!(file instanceof File) || file.size === 0) {
    return { error: "ارفع شعار المكتب." }
  }
  if (file.size > MAX_LOGO_BYTES) {
    return { error: "الحد الأقصى لشعار المكتب 3 ميغابايت." }
  }
  if (!file.type.startsWith("image/")) {
    return { error: "شعار المكتب يجب أن يكون صورة." }
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const path = `${userId}/agency-logo/${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const contentType = file.type || "image/jpeg"

  // Signup may lack a session cookie yet — prefer service role when asked.
  if (opts?.preferServiceRole) {
    try {
      const admin = createServiceClient()
      const { error } = await admin.storage
        .from("listing-images")
        .upload(path, buffer, { contentType, upsert: true })
      if (error) return { error: error.message }
      return { url: avatarPublicUrl(path) }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "تعذّر رفع الشعار."
      return { error: msg }
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.storage
    .from("listing-images")
    .upload(path, buffer, {
      contentType,
      upsert: true,
    })
  if (error) return { error: error.message }
  return { url: avatarPublicUrl(path) }
}

/** Upload project cover to listing-images/{userId}/project-cover/… */
export async function uploadProjectCoverFile(
  userId: string,
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!(file instanceof File) || file.size === 0) {
    return { error: "اختر صورة للمشروع." }
  }
  if (file.size > MAX_LOGO_BYTES) {
    return { error: "الحد الأقصى لصورة المشروع 3 ميغابايت." }
  }
  if (!file.type.startsWith("image/")) {
    return { error: "الملف يجب أن يكون صورة." }
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const path = `${userId}/project-cover/${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const contentType = file.type || "image/jpeg"

  const supabase = await createClient()
  const { error } = await supabase.storage
    .from("listing-images")
    .upload(path, buffer, { contentType, upsert: true })
  if (error) return { error: error.message }
  return { url: avatarPublicUrl(path) }
}

/** Community gallery photo → listing-images/{userId}/project-photos/{projectId}/… */
export async function uploadProjectGalleryFile(
  userId: string,
  projectId: string,
  file: File
): Promise<{ path: string; url: string } | { error: string }> {
  if (!(file instanceof File) || file.size === 0) {
    return { error: "اختر صورة للمشاركة." }
  }
  if (file.size > MAX_LOGO_BYTES) {
    return { error: "الحد الأقصى للصورة 3 ميغابايت." }
  }
  if (!file.type.startsWith("image/")) {
    return { error: "الملف يجب أن يكون صورة." }
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const path = `${userId}/project-photos/${projectId}/${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const contentType = file.type || "image/jpeg"

  const supabase = await createClient()
  const { error } = await supabase.storage
    .from("listing-images")
    .upload(path, buffer, { contentType, upsert: false })
  if (error) return { error: error.message }
  return { path, url: avatarPublicUrl(path) }
}

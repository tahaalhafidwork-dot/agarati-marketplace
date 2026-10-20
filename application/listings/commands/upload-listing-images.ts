import { prisma } from "@/lib/db"
import { createClient } from "@/lib/supabase/server"

export async function uploadListingImages(
  listingId: string,
  userId: string,
  files: File[]
) {
  const supabase = await createClient()
  const last = await prisma.listingImage.findFirst({
    where: { listingId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  })
  let order = (last?.sortOrder ?? -1) + 1
  for (const file of files.slice(0, 8)) {
    const ext = file.name.split(".").pop() || "jpg"
    const path = `${userId}/${listingId}/${Date.now()}-${order}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const { error } = await supabase.storage
      .from("listing-images")
      .upload(path, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      })
    if (error) continue
    await prisma.listingImage.create({
      data: { listingId, storagePath: path, sortOrder: order },
    })
    order += 1
  }
}

export function collectListingImageFiles(formData: FormData): File[] | { error: string } {
  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, 8)
  const maxPerFile = 4 * 1024 * 1024
  if (files.some((f) => f.size > maxPerFile)) {
    return { error: "كل صورة يجب أن تكون أقل من 4 ميجابايت." }
  }
  return files
}

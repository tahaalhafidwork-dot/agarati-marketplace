"use server"

import { revalidatePath } from "next/cache"

import { requireSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { savedSearchQueryKey } from "@/lib/saved-search"

export type SavedSearchResult = {
  saved?: boolean
  id?: string
  error?: string
  code?: string
}

export async function toggleSavedSearchAction(input: {
  href: string
  title: string
}): Promise<SavedSearchResult> {
  if (!isDatabaseConfigured()) {
    return { error: "قاعدة البيانات غير مُعدّة.", code: "DB" }
  }

  let user
  try {
    user = await requireSessionUser()
  } catch {
    return { error: "يجب تسجيل الدخول.", code: "UNAUTHORIZED" }
  }

  const href = input.href.startsWith("/") ? input.href : `/${input.href}`
  if (!href.startsWith("/properties")) {
    return { error: "رابط البحث غير صالح.", code: "INVALID" }
  }

  const queryKey = savedSearchQueryKey(href)
  const title = input.title.trim().slice(0, 120) || "بحث محفوظ"

  const existing = await prisma.savedSearch.findUnique({
    where: {
      userId_queryKey: { userId: user.id, queryKey },
    },
  })

  if (existing) {
    await prisma.savedSearch.delete({ where: { id: existing.id } })
    revalidatePath("/dashboard/favorites")
    revalidatePath("/properties")
    return { saved: false }
  }

  const row = await prisma.savedSearch.create({
    data: {
      userId: user.id,
      title,
      href: queryKey ? `/properties?${queryKey}` : "/properties",
      queryKey,
    },
  })
  revalidatePath("/dashboard/favorites")
  revalidatePath("/properties")
  return { saved: true, id: row.id }
}

export async function removeSavedSearchAction(id: string): Promise<void> {
  if (!isDatabaseConfigured()) {
    return
  }
  let user
  try {
    user = await requireSessionUser()
  } catch {
    return
  }
  await prisma.savedSearch.deleteMany({
    where: { id, userId: user.id },
  })
  revalidatePath("/dashboard/favorites")
}

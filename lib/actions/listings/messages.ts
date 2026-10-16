"use server"

import { revalidatePath } from "next/cache"

import {
  countUnreadMessages,
  isListingMessageParticipant,
  type ThreadMessageDto,
} from "@/application/listings/messages/count-unread"
import { requireSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"

export type { ThreadMessageDto }

export async function sendMessageAction(
  _prev: {
    error?: string
    success?: string
    code?: string
    messageId?: string
  },
  formData: FormData
): Promise<{
  error?: string
  success?: string
  code?: string
  messageId?: string
}> {
  if (!isDatabaseConfigured()) {
    return { error: "قاعدة البيانات غير مُعدّة.", code: "DB" }
  }

  let user
  try {
    user = await requireSessionUser()
  } catch {
    return { error: "يجب تسجيل الدخول للمراسلة.", code: "UNAUTHORIZED" }
  }

  const listingId = String(formData.get("listingId") ?? "")
  const content = String(formData.get("content") ?? "").trim()

  if (!listingId || !content) {
    return { error: "محتوى الرسالة مطلوب." }
  }
  if (content.length > 2000) {
    return { error: "الرسالة طويلة جداً." }
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, ownerId: true, contactMethod: true, status: true },
  })

  if (!listing || listing.status !== "ACTIVE") {
    return { error: "الإعلان غير متاح للمراسلة.", code: "NOT_FOUND" }
  }

  if (listing.contactMethod === "WHATSAPP_PHONE") {
    return { error: "هذا الإعلان لا يقبل المراسلة عبر التطبيق." }
  }

  let createdId: string | null = null

  if (listing.ownerId === user.id) {
    const counterpart = await prisma.message.findFirst({
      where: {
        listingId,
        toId: user.id,
        NOT: { fromId: user.id },
      },
      orderBy: { createdAt: "desc" },
      select: { fromId: true },
    })
    if (!counterpart) {
      return { error: "لا يوجد محاور للرد عليه بعد." }
    }
    const row = await prisma.message.create({
      data: {
        listingId,
        fromId: user.id,
        toId: counterpart.fromId,
        content,
      },
      select: { id: true },
    })
    createdId = row.id
  } else {
    const row = await prisma.message.create({
      data: {
        listingId,
        fromId: user.id,
        toId: listing.ownerId,
        content,
      },
      select: { id: true },
    })
    createdId = row.id
  }

  revalidatePath(`/dashboard/messages/${listingId}`)
  revalidatePath("/dashboard/messages")
  revalidatePath("/dashboard")
  revalidatePath("/")
  return {
    success: "تم إرسال الرسالة.",
    code: "OK",
    messageId: createdId ?? undefined,
  }
}

export async function getMessagesAction(
  listingId: string
): Promise<ThreadMessageDto[]> {
  if (!isDatabaseConfigured()) return []

  const user = await requireSessionUser()
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, ownerId: true, contactMethod: true },
  })

  if (!listing) return []

  const participant = await isListingMessageParticipant(listingId, user.id)
  const isOwner = listing.ownerId === user.id
  if (!isOwner && !participant) return []

  const messages = await prisma.message.findMany({
    where: {
      listingId,
      OR: [{ fromId: user.id }, { toId: user.id }],
    },
    include: {
      from: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  await prisma.message.updateMany({
    where: {
      listingId,
      toId: user.id,
      readAt: null,
    },
    data: { readAt: new Date() },
  })

  return messages.map((m) => ({
    id: m.id,
    content: m.content,
    fromId: m.fromId,
    fromName: m.from.name,
    createdAt: m.createdAt.toISOString(),
  }))
}

export async function markMessagesReadAction(listingId: string) {
  const user = await requireSessionUser()
  if (!isDatabaseConfigured()) throw new Error("DB_NOT_CONFIGURED")

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { ownerId: true },
  })
  if (!listing) return
  const participant = await isListingMessageParticipant(listingId, user.id)
  if (listing.ownerId !== user.id && !participant) return

  await prisma.message.updateMany({
    where: {
      listingId,
      toId: user.id,
      readAt: null,
    },
    data: { readAt: new Date() },
  })
  revalidatePath("/dashboard/messages")
  revalidatePath("/dashboard")
  revalidatePath("/")
}

export async function getUnreadMessagesCountAction(): Promise<{
  count: number
  error?: string
}> {
  try {
    const user = await requireSessionUser()
    const count = await countUnreadMessages(user.id)
    return { count }
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e
    const msg = e instanceof Error ? e.message : "تعذر جلب عدد الرسائل"
    if (msg === "UNAUTHORIZED") return { count: 0 }
    return { count: 0, error: msg }
  }
}

export { countUnreadMessages }

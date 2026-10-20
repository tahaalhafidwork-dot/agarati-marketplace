"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { Prisma } from "@prisma/client"

import { requireSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import {
  categoryToPrisma,
  dealToPrisma,
} from "@/lib/listings"
import {
  parsePropertyRequestForm,
  toPrismaRequestData,
} from "@/lib/property-requests"
import { isDealType, isPropertyCategory } from "@/lib/sample-listings"

export type PropertyRequestActionState = {
  error?: string
  success?: string
  id?: string
}

export async function createPropertyRequestAction(
  _prev: PropertyRequestActionState,
  formData: FormData
): Promise<PropertyRequestActionState> {
  if (!isDatabaseConfigured()) {
    return { error: "قاعدة البيانات غير مُعدّة." }
  }
  let user
  try {
    user = await requireSessionUser()
  } catch {
    return { error: "يجب تسجيل الدخول أولاً." }
  }

  const parsed = parsePropertyRequestForm(formData)
  if (parsed.error) return { error: parsed.error }

  const row = await prisma.propertyRequest.create({
    data: {
      userId: user.id,
      ...toPrismaRequestData(parsed),
      status: "PENDING",
    },
  })

  revalidatePath("/dashboard/property-requests")
  revalidatePath("/admin/property-requests")
  revalidatePath("/admin")
  redirect(`/dashboard/property-requests/${row.id}`)
}

export async function updatePropertyRequestAction(
  _prev: PropertyRequestActionState,
  formData: FormData
): Promise<PropertyRequestActionState> {
  if (!isDatabaseConfigured()) {
    return { error: "قاعدة البيانات غير مُعدّة." }
  }
  let user
  try {
    user = await requireSessionUser()
  } catch {
    return { error: "يجب تسجيل الدخول أولاً." }
  }

  const id = String(formData.get("id") ?? "").trim()
  if (!id) return { error: "معرّف الطلب مفقود." }

  const existing = await prisma.propertyRequest.findUnique({
    where: { id },
    select: { userId: true, status: true },
  })
  const isAdmin = user.role === "ADMIN"
  if (!existing || (existing.userId !== user.id && !isAdmin)) {
    return { error: "لا يمكنك تعديل هذا الطلب." }
  }

  const parsed = parsePropertyRequestForm(formData)
  if (parsed.error) return { error: parsed.error }

  // Owner content edits re-enter moderation. Admin edits keep status
  // unless explicitly closing/fulfilling.
  let nextStatus = existing.status
  if (!isAdmin) {
    nextStatus =
      existing.status === "OPEN" &&
      (parsed.status === "FULFILLED" || parsed.status === "CLOSED")
        ? parsed.status
        : "PENDING"
  } else if (
    parsed.status === "FULFILLED" ||
    parsed.status === "CLOSED" ||
    parsed.status === "OPEN" ||
    parsed.status === "PENDING" ||
    parsed.status === "REJECTED"
  ) {
    nextStatus = parsed.status
  }

  await prisma.propertyRequest.update({
    where: { id },
    data: {
      ...toPrismaRequestData({ ...parsed, status: undefined }),
      status: nextStatus,
    },
  })

  revalidatePath("/dashboard/property-requests")
  revalidatePath(`/dashboard/property-requests/${id}`)
  revalidatePath(`/dashboard/property-requests/${id}/edit`)
  revalidatePath("/admin/property-requests")
  revalidatePath("/admin")
  redirect(
    isAdmin
      ? "/admin/property-requests"
      : `/dashboard/property-requests/${id}`
  )
}

export async function deletePropertyRequestAction(id: string): Promise<void> {
  if (!isDatabaseConfigured()) return
  let user
  try {
    user = await requireSessionUser()
  } catch {
    return
  }

  const existing = await prisma.propertyRequest.findUnique({
    where: { id },
    select: { userId: true },
  })
  if (!existing) return

  const isAdmin = user.role === "ADMIN"
  if (existing.userId !== user.id && !isAdmin) return

  await prisma.propertyRequest.delete({ where: { id } })
  revalidatePath("/dashboard/property-requests")
  revalidatePath("/admin/property-requests")
  revalidatePath("/admin")
  // Owner form submissions leave the detail page; admin list refreshes itself.
  if (!isAdmin) {
    redirect("/dashboard/property-requests?tab=new#my-requests")
  }
}

export async function sendPropertyRequestMessageAction(
  _prev: { error?: string; success?: string },
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  if (!isDatabaseConfigured()) {
    return { error: "قاعدة البيانات غير مُعدّة." }
  }
  let user
  try {
    user = await requireSessionUser()
  } catch {
    return { error: "يجب تسجيل الدخول." }
  }

  const requestId = String(formData.get("requestId") ?? "").trim()
  const content = String(formData.get("content") ?? "").trim()
  const peerId = String(formData.get("peerId") ?? "").trim() || null

  if (!requestId || content.length < 2) {
    return { error: "اكتب رسالة قصيرة على الأقل." }
  }

  const request = await prisma.propertyRequest.findUnique({
    where: { id: requestId },
    select: { id: true, userId: true, status: true },
  })
  if (!request) return { error: "الطلب غير موجود." }
  if (request.status === "CLOSED") {
    return { error: "هذا الطلب مغلق ولا يقبل رسائل جديدة." }
  }
  if (request.status === "PENDING" || request.status === "REJECTED") {
    return { error: "الطلب غير منشور بعد — بانتظار موافقة الإدارة." }
  }
  if (request.status !== "OPEN" && request.status !== "FULFILLED") {
    return { error: "لا يمكن المراسلة على هذا الطلب حالياً." }
  }

  const isOwner = request.userId === user.id
  let toId: string

  if (isOwner) {
    if (!peerId) return { error: "اختر محادثة للرد عليها." }
    if (peerId === user.id) return { error: "لا يمكن إرسال رسالة لنفسك." }
    toId = peerId
  } else {
    if (user.id === request.userId) {
      return { error: "لا يمكن مراسلة نفسك." }
    }
    toId = request.userId
  }

  await prisma.propertyRequestMessage.create({
    data: {
      requestId,
      fromId: user.id,
      toId,
      content: content.slice(0, 2000),
    },
  })

  revalidatePath(`/dashboard/property-requests/${requestId}`)
  revalidatePath(`/dashboard/messages/request/${requestId}`)
  revalidatePath("/dashboard/messages")
  revalidatePath("/dashboard")
  revalidatePath("/")
  return { success: "تم الإرسال" }
}

export type PropertyRequestThreadMessageDto = {
  id: string
  content: string
  fromId: string
  fromName: string
  createdAt: string
}

export async function getPropertyRequestMessagesAction(
  requestId: string,
  peerId: string
): Promise<PropertyRequestThreadMessageDto[]> {
  if (!isDatabaseConfigured()) return []
  const user = await requireSessionUser()

  const request = await prisma.propertyRequest.findUnique({
    where: { id: requestId },
    select: { userId: true },
  })
  if (!request) return []

  const isOwner = request.userId === user.id
  const counterpart = isOwner ? peerId : request.userId
  if (!counterpart || counterpart === user.id) return []

  const messages = await prisma.propertyRequestMessage.findMany({
    where: {
      requestId,
      OR: [
        { fromId: user.id, toId: counterpart },
        { fromId: counterpart, toId: user.id },
      ],
    },
    include: { from: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  })

  await prisma.propertyRequestMessage.updateMany({
    where: {
      requestId,
      toId: user.id,
      fromId: counterpart,
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

export type PropertyRequestFilters = {
  tab?: string
  category?: string
  deal?: string
  city?: string
  status?: string
  q?: string
}

export async function listPropertyRequests(
  filters: PropertyRequestFilters,
  opts?: { mineOnly?: boolean; userId?: string }
) {
  if (!isDatabaseConfigured()) return []

  const where: Prisma.PropertyRequestWhereInput = {}

  if (opts?.mineOnly && opts.userId) {
    where.userId = opts.userId
  } else if (!opts?.mineOnly) {
    where.status = "OPEN"
  }

  if (
    !opts?.mineOnly &&
    (filters.status === "OPEN" ||
      filters.status === "FULFILLED" ||
      filters.status === "CLOSED")
  ) {
    where.status = filters.status
  } else if (opts?.mineOnly && filters.status) {
    if (
      filters.status === "OPEN" ||
      filters.status === "FULFILLED" ||
      filters.status === "CLOSED" ||
      filters.status === "PENDING" ||
      filters.status === "REJECTED"
    ) {
      where.status = filters.status
    }
  }

  if (filters.category && isPropertyCategory(filters.category)) {
    where.category = categoryToPrisma[filters.category]
  }
  if (filters.deal && isDealType(filters.deal)) {
    where.deal = dealToPrisma[filters.deal]
  }
  if (filters.city) where.citySlug = filters.city
  if (filters.q?.trim()) {
    where.OR = [
      { title: { contains: filters.q.trim(), mode: "insensitive" } },
      { description: { contains: filters.q.trim(), mode: "insensitive" } },
    ]
  }

  return prisma.propertyRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 48,
    include: {
      user: { select: { id: true, name: true } },
      _count: { select: { messages: true } },
    },
  })
}

export async function moderatePropertyRequestAction(
  requestId: string,
  decision: "OPEN" | "REJECTED"
) {
  const { requireAdmin } = await import("@/lib/auth")
  await requireAdmin()
  if (!isDatabaseConfigured()) throw new Error("DB not configured")

  await prisma.propertyRequest.update({
    where: { id: requestId },
    data: { status: decision },
  })

  revalidatePath("/admin/property-requests")
  revalidatePath("/admin")
  revalidatePath("/dashboard/property-requests")
  revalidatePath(`/dashboard/property-requests/${requestId}`)
}

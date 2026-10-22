import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { MessageThreadLive } from "@/app/dashboard/messages/message-thread-live"
import { getSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"

type Params = Promise<{ listingId: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { listingId } = await params
  const user = await getSessionUser()
  if (!user || !isDatabaseConfigured()) return { title: "محادثة" }
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { title: true, ownerId: true },
  })
  if (!listing) return { title: "محادثة" }
  const prior = await prisma.message.findFirst({
    where: {
      listingId,
      OR: [{ fromId: user.id }, { toId: user.id }],
    },
    select: { id: true },
  })
  if (listing.ownerId !== user.id && !prior) return { title: "محادثة" }
  return { title: `محادثة · ${listing.title}` }
}

export default async function MessageThreadPage({
  params,
}: {
  params: Params
}) {
  const { listingId } = await params
  const user = await getSessionUser()

  if (!user) {
    redirect(`/login?next=/dashboard/messages/${listingId}`)
  }
  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        اربط قاعدة البيانات أولاً.
      </p>
    )
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      ownerId: true,
      contactMethod: true,
      status: true,
    },
  })
  if (!listing) notFound()

  const isOwner = listing.ownerId === user.id
  const prior = await prisma.message.findFirst({
    where: {
      listingId,
      OR: [{ fromId: user.id }, { toId: user.id }],
    },
    select: { id: true },
  })

  // A contact method is not permission to read another person's thread.
  if (!isOwner && !prior) notFound()

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

  return (
    <MessageThreadLive
      mode="listing"
      listingId={listing.id}
      listingTitle={listing.title}
      currentUserId={user.id}
      currentUserName={user.name}
      isOwner={isOwner}
      initialMessages={messages.map((m) => ({
        id: m.id,
        content: m.content,
        fromId: m.fromId,
        fromName: m.from.name,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  )
}

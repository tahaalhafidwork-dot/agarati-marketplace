import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { MessageThreadLive } from "@/app/dashboard/messages/message-thread-live"
import { buttonVariants } from "@/components/ui/button"
import { getPropertyRequestMessagesAction } from "@/lib/actions/property-requests"
import { getSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { cn } from "@/lib/utils"

type Params = Promise<{ requestId: string }>
type SearchParams = Promise<Record<string, string | string[] | undefined>>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { requestId } = await params
  if (!isDatabaseConfigured()) return { title: "محادثة طلب" }
  const row = await prisma.propertyRequest.findUnique({
    where: { id: requestId },
    select: { title: true },
  })
  return { title: row ? `طلب عقار · ${row.title}` : "محادثة طلب" }
}

export default async function PropertyRequestMessageThreadPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { requestId } = await params
  const sp = await searchParams
  const peerRaw = Array.isArray(sp.peer) ? sp.peer[0] : sp.peer

  const user = await getSessionUser()
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/dashboard/messages/request/${requestId}`)}`
    )
  }
  if (!isDatabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">اربط قاعدة البيانات أولاً.</p>
    )
  }

  const request = await prisma.propertyRequest.findUnique({
    where: { id: requestId },
    include: {
      user: { select: { id: true, name: true } },
      messages: {
        include: { from: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })
  if (!request) notFound()

  const isOwner = request.userId === user.id

  if (isOwner) {
    if (!peerRaw) {
      return (
        <div className="space-y-3 rounded-2xl border border-dashed border-border bg-card px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            اختر محادثة من صندوق الرسائل أو من صفحة الطلب.
          </p>
          <Link
            href="/dashboard/messages"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            صندوق الرسائل
          </Link>
        </div>
      )
    }
    if (peerRaw === user.id) notFound()
  } else if (user.id === request.userId) {
    notFound()
  }

  const peerId = isOwner ? peerRaw! : request.userId
  const peerUser = isOwner
    ? await prisma.user.findUnique({
        where: { id: peerId },
        select: { id: true, name: true },
      })
    : request.user

  if (!peerUser) notFound()

  const initialMessages = await getPropertyRequestMessagesAction(
    requestId,
    peerId
  )

  return (
    <MessageThreadLive
      mode="request"
      requestId={request.id}
      requestTitle={request.title}
      peerId={peerUser.id}
      peerName={peerUser.name}
      disabled={request.status === "CLOSED"}
      currentUserId={user.id}
      currentUserName={user.name}
      initialMessages={initialMessages}
    />
  )
}

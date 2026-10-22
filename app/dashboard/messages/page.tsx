import type { Metadata } from "next"
import Link from "next/link"
import { Building2, CalendarClock, ClipboardList, Home, MessageCircle } from "lucide-react"

import { AcceptInvitationByIdForm } from "@/components/agency/accept-invitation-form"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { getSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "الرسائل",
}

type InboxRow = {
  key: string
  href: string
  title: string
  preview: string
  at: Date
  unread: number
  kind: "listing" | "request"
  subtitle?: string
}

type AgencyInvitationRow = {
  id: string
  expiresAt: Date
  agency: { name: string }
  invitedBy: { name: string }
}

export default async function MessagesInboxPage() {
  const user = await getSessionUser()
  let threads: InboxRow[] = []
  let agencyInvitations: AgencyInvitationRow[] = []

  if (user && isDatabaseConfigured()) {
    const [listingMessages, requestMessages, invitations] = await Promise.all([
      prisma.message.findMany({
        where: { OR: [{ fromId: user.id }, { toId: user.id }] },
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { listing: { select: { id: true, title: true } } },
      }),
      prisma.propertyRequestMessage.findMany({
        where: { OR: [{ fromId: user.id }, { toId: user.id }] },
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
          request: { select: { id: true, title: true, userId: true } },
          from: { select: { id: true, name: true } },
        },
      }),
      prisma.agencyInvitation.findMany({
        where: {
          status: "PENDING",
          expiresAt: { gt: new Date() },
          OR: [
            { invitedUserId: user.id },
            { emailNormalized: user.email.trim().toLowerCase() },
          ],
        },
        select: {
          id: true,
          expiresAt: true,
          agency: { select: { name: true } },
          invitedBy: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ])
    agencyInvitations = invitations

    const listingMap = new Map<string, InboxRow>()
    for (const msg of listingMessages) {
      const existing = listingMap.get(msg.listingId)
      if (!existing) {
        listingMap.set(msg.listingId, {
          key: `listing:${msg.listingId}`,
          href: `/dashboard/messages/${msg.listingId}`,
          title: msg.listing.title,
          preview: msg.content,
          at: msg.createdAt,
          unread: msg.toId === user.id && !msg.readAt ? 1 : 0,
          kind: "listing",
        })
      } else if (msg.toId === user.id && !msg.readAt) {
        existing.unread += 1
      }
    }

    // Peer-scoped request threads: owner↔peer keyed by requestId+peerId
    const requestMap = new Map<string, InboxRow>()
    const peerNames = new Map<string, string>()

    for (const msg of requestMessages) {
      const isOwner = msg.request.userId === user.id
      const peerId = isOwner
        ? msg.fromId === user.id
          ? msg.toId
          : msg.fromId
        : msg.request.userId
      if (peerId === user.id) continue

      if (msg.fromId !== user.id) {
        peerNames.set(msg.fromId, msg.from.name)
      }

      const key = `request:${msg.requestId}:${peerId}`
      const existing = requestMap.get(key)
      if (!existing) {
        requestMap.set(key, {
          key,
          href: isOwner
            ? `/dashboard/messages/request/${msg.requestId}?peer=${peerId}`
            : `/dashboard/messages/request/${msg.requestId}`,
          title: msg.request.title,
          preview: msg.content,
          at: msg.createdAt,
          unread: msg.toId === user.id && !msg.readAt ? 1 : 0,
          kind: "request",
          subtitle: peerNames.get(peerId),
        })
      } else if (msg.toId === user.id && !msg.readAt) {
        existing.unread += 1
      }
    }

    // Resolve missing peer names for owner rows
    const missingPeerIds = [...requestMap.values()]
      .filter((r) => r.kind === "request" && !r.subtitle)
      .map((r) => {
        const parts = r.key.split(":")
        return parts[2]
      })
      .filter(Boolean)

    if (missingPeerIds.length > 0) {
      const peers = await prisma.user.findMany({
        where: { id: { in: [...new Set(missingPeerIds)] } },
        select: { id: true, name: true },
      })
      const byId = new Map(peers.map((p) => [p.id, p.name]))
      for (const row of requestMap.values()) {
        if (!row.subtitle) {
          const peerId = row.key.split(":")[2]
          row.subtitle = byId.get(peerId)
        }
      }
    }

    threads = [...listingMap.values(), ...requestMap.values()].sort(
      (a, b) => b.at.getTime() - a.at.getTime()
    )
  }

  const unreadTotal =
    threads.reduce((n, t) => n + t.unread, 0) + agencyInvitations.length

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <MessageCircle className="size-5" />
          الرسائل والتنبيهات
        </h1>
        <p className="text-sm text-muted-foreground">
          محادثات العقارات وطلبات العقار ودعوات الوكالات
          {unreadTotal > 0 ? ` · ${unreadTotal} غير مقروء` : ""}
        </p>
      </div>

      {agencyInvitations.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-[color:var(--brand-gold)]/35 bg-[linear-gradient(145deg,#fffdf9,#faf6ef)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[color:var(--brand-gold)]/20 px-4 py-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#0F2744] text-[color:var(--brand-gold)]">
              <Building2 className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-[#0F2744]">دعوات الوكالات</h2>
              <p className="text-xs text-muted-foreground">راجع الدعوة قبل الانضمام؛ حسابك الشخصي يبقى مستقلًا.</p>
            </div>
          </div>
          <ul className="divide-y divide-[color:var(--brand-gold)]/20">
            {agencyInvitations.map((invitation) => (
              <li key={invitation.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-[#0F2744] text-white">دعوة وكالة</Badge>
                    <p className="truncate text-sm font-semibold text-[#0F2744]">{invitation.agency.name}</p>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">أرسلها {invitation.invitedBy.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5" aria-hidden="true" />
                    تنتهي {invitation.expiresAt.toLocaleString("ar-IQ-u-nu-latn")}
                  </p>
                </div>
                <AcceptInvitationByIdForm invitationId={invitation.id} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!isDatabaseConfigured() ? (
        <p className="text-sm text-muted-foreground">
          اربط قاعدة البيانات أولاً — docs/SUPABASE_SETUP.md
        </p>
      ) : !user ? (
        <p className="text-sm text-muted-foreground">
          <Link
            href="/login?next=/dashboard/messages"
            className="font-medium text-primary hover:underline"
          >
            سجّل الدخول
          </Link>{" "}
          لعرض الرسائل.
        </p>
      ) : threads.length === 0 && agencyInvitations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">لا رسائل بعد.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              href="/properties"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              تصفح الإعلانات
            </Link>
            <Link
              href="/dashboard/property-requests"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              طلبات العقار
            </Link>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {threads.map((thread) => (
            <li key={thread.key}>
              <Link
                href={thread.href}
                className="flex items-start gap-3 px-4 py-3.5 transition hover:bg-muted/40"
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
                    thread.kind === "request"
                      ? "bg-[color:var(--brand-gold)]/15 text-[color:var(--brand-gold)]"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {thread.kind === "request" ? (
                    <ClipboardList className="size-4" />
                  ) : (
                    <Home className="size-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      {thread.kind === "request" ? (
                        <Badge className="rounded-md bg-[color:var(--brand-gold)]/20 px-1.5 py-0 text-[0.6rem] font-semibold text-[#0F2744]">
                          طلب عقار
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="rounded-md px-1.5 py-0 text-[0.6rem]"
                        >
                          إعلان
                        </Badge>
                      )}
                      <p className="truncate text-sm font-semibold">
                        {thread.title}
                      </p>
                    </div>
                    {thread.unread > 0 ? (
                      <Badge className="rounded-full px-1.5 py-0 text-[0.65rem]">
                        {thread.unread}
                      </Badge>
                    ) : null}
                  </div>
                  {thread.subtitle ? (
                    <p className="mt-0.5 truncate text-[0.7rem] text-muted-foreground">
                      مع {thread.subtitle}
                    </p>
                  ) : null}
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {thread.preview}
                  </p>
                  <p className="mt-1 text-[0.65rem] text-muted-foreground">
                    {thread.at.toLocaleString("ar-IQ-u-nu-latn")}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

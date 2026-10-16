import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  ArrowRight,
  MapPin,
  MessageCircle,
  Pencil,
  Trash2,
  Wallet,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { deletePropertyRequestAction } from "@/lib/actions/property-requests"
import { getSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import {
  formatAreaRange,
  requestStatusLabels,
  toPropertyRequestCard,
} from "@/lib/property-requests"
import { cn } from "@/lib/utils"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  if (!isDatabaseConfigured()) return { title: "طلب عقار" }
  const row = await prisma.propertyRequest.findUnique({
    where: { id },
    select: { title: true },
  })
  return { title: row?.title ? `${row.title} · طلب عقار` : "طلب عقار" }
}

export default async function PropertyRequestDetailPage({ params }: Props) {
  const { id } = await params

  const user = await getSessionUser()
  if (!user) {
    redirect(`/login?next=/dashboard/property-requests/${id}`)
  }
  if (!isDatabaseConfigured()) notFound()

  const row = await prisma.propertyRequest.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      _count: { select: { messages: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        include: { from: { select: { id: true, name: true } } },
        take: 80,
      },
    },
  })
  if (!row) notFound()

  const card = toPropertyRequestCard(row)
  const isOwner = row.userId === user.id
  const isAdmin = user.role === "ADMIN"
  if (
    !isOwner &&
    !isAdmin &&
    card.status !== "OPEN" &&
    card.status !== "FULFILLED"
  ) {
    notFound()
  }

  const areaRange = formatAreaRange(card.minAreaM2, card.maxAreaM2)
  const closed = card.status === "CLOSED"
  const notPublic =
    card.status === "PENDING" || card.status === "REJECTED"

  const peerIds = new Set<string>()
  for (const m of row.messages) {
    if (m.fromId !== row.userId) peerIds.add(m.fromId)
    if (m.toId !== row.userId) peerIds.add(m.toId)
  }
  peerIds.delete(row.userId)

  const peers = Array.from(peerIds).map((pid) => {
    const sample = row.messages.find(
      (m) => m.fromId === pid || m.toId === pid
    )
    const name =
      sample?.fromId === pid
        ? sample.from.name
        : row.messages.find((m) => m.fromId === pid)?.from.name ?? "معلن"
    return { id: pid, name }
  })

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/property-requests"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="size-3.5" />
        كل الطلبات
      </Link>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-[color:var(--brand-gold)]/25 bg-[linear-gradient(135deg,#0F2744_0%,#1a3a5c_100%)] px-4 py-5 text-[#f8f1e6] sm:px-5">
            <div className="flex flex-wrap items-center gap-1.5">
              {card.dealLabel ? (
                <Badge className="rounded-md bg-[color:var(--brand-gold)] text-[0.65rem] text-[#0F2744]">
                  {card.dealLabel}
                </Badge>
              ) : null}
              {card.categoryLabel ? (
                <Badge
                  variant="secondary"
                  className="rounded-md bg-white/10 text-[0.65rem] text-[#f8f1e6]"
                >
                  {card.categoryLabel}
                </Badge>
              ) : null}
              <Badge
                variant="outline"
                className="rounded-md border-white/25 text-[0.65rem] text-[#f8f1e6]/85"
              >
                {requestStatusLabels[card.status]}
              </Badge>
            </div>
            <h1 className="mt-3 text-xl font-semibold leading-snug sm:text-2xl">
              {card.title}
            </h1>
            <p className="mt-2 text-xs text-[#f8f1e6]/6">
              بواسطة {card.ownerName} ·{" "}
              {card.createdAt.toLocaleDateString("ar-IQ")}
            </p>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
              {card.description}
            </p>

            <dl className="grid gap-3 rounded-xl border border-border bg-muted/20 p-3 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 text-[color:var(--brand-gold)]" />
                <div>
                  <dt className="text-xs text-muted-foreground">الموقع</dt>
                  <dd className="font-medium">{card.areaLabel}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Wallet className="mt-0.5 size-4 text-[color:var(--brand-gold)]" />
                <div>
                  <dt className="text-xs text-muted-foreground">الميزانية</dt>
                  <dd className="font-medium text-[color:var(--brand-gold)]">
                    {card.budgetLabel}
                  </dd>
                </div>
              </div>
              {card.rooms ? (
                <div>
                  <dt className="text-xs text-muted-foreground">الغرف</dt>
                  <dd className="font-medium">{card.rooms}</dd>
                </div>
              ) : null}
              {areaRange ? (
                <div>
                  <dt className="text-xs text-muted-foreground">المساحة</dt>
                  <dd className="font-medium">{areaRange}</dd>
                </div>
              ) : null}
            </dl>

            {isOwner ? (
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Link
                  href={`/dashboard/property-requests/${id}/edit`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-full gap-1.5"
                  )}
                >
                  <Pencil className="size-3.5" />
                  تعديل
                </Link>
                <form action={deletePropertyRequestAction.bind(null, id)}>
                  <button
                    type="submit"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "rounded-full gap-1.5 text-destructive hover:text-destructive"
                    )}
                  >
                    <Trash2 className="size-3.5" />
                    حذف الطلب
                  </button>
                </form>
              </div>
            ) : null}

            {notPublic ? (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs leading-5 text-amber-950">
                {card.status === "PENDING"
                  ? "طلبك قيد مراجعة الإدارة ولن يظهر في التصفح العام حتى يُقبل."
                  : "رُفض هذا الطلب من الإدارة. يمكنك تعديله وإعادة الإرسال للمراجعة."}
              </p>
            ) : null}
          </div>
        </article>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-[color:var(--brand-gold)]/30 bg-[linear-gradient(160deg,#fffdf9,#f6efe4)] p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-[#0F2744] text-[color:var(--brand-gold)]">
                <MessageCircle className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#0F2744]">المراسلة</p>
                <p className="text-[0.7rem] text-muted-foreground">
                  المحادثات تظهر في صندوق الرسائل مع وسم «طلب عقار»
                </p>
              </div>
            </div>

            {isOwner ? (
              peers.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  {notPublic
                    ? "المراسلة متاحة بعد قبول الإدارة ونشر الطلب."
                    : "لم تصل رسائل بعد. عندما يراسل معلن طلبك ستجد المحادثة في "}
                  {!notPublic ? (
                    <>
                      <Link
                        href="/dashboard/messages"
                        className="font-medium text-primary hover:underline"
                      >
                        الرسائل
                      </Link>
                      .
                    </>
                  ) : null}
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {peers.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/dashboard/messages/request/${id}?peer=${p.id}`}
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "h-10 w-full justify-between rounded-xl"
                        )}
                      >
                        <span className="truncate">محادثة مع {p.name}</span>
                        <MessageCircle className="size-3.5 shrink-0" />
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/dashboard/messages"
                      className="block text-center text-xs text-primary hover:underline"
                    >
                      فتح صندوق الرسائل
                    </Link>
                  </li>
                </ul>
              )
            ) : closed ? (
              <p className="mt-4 text-sm text-muted-foreground">
                هذا الطلب مغلق ولا يقبل رسائل جديدة.
              </p>
            ) : card.status !== "OPEN" && card.status !== "FULFILLED" ? (
              <p className="mt-4 text-sm text-muted-foreground">
                هذا الطلب غير متاح للمراسلة حالياً.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                <Link
                  href={`/dashboard/messages/request/${id}`}
                  className={cn(
                    buttonVariants(),
                    "h-11 w-full gap-1.5 rounded-xl"
                  )}
                >
                  <MessageCircle className="size-4" />
                  راسل صاحب الطلب
                </Link>
                <p className="text-center text-[0.7rem] text-muted-foreground">
                  ستُفتح المحادثة في قسم الرسائل مع وسم طلب العقار.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

"use client"

import { MessageSquare, Phone } from "lucide-react"
import { useState, useTransition, type MouseEvent } from "react"
import { usePathname, useRouter } from "next/navigation"

import { ListingFavoriteButton } from "@/components/property/listing-favorite-button"
import { ListingAdvertiserLink } from "@/components/property/listing-advertiser-link"
import { ListingMessageSheet } from "@/components/property/listing-message-sheet"
import { sendMessageAction } from "@/lib/actions/listings"
import type { AdvertiserKind } from "@/lib/demo-advertisers"
import { telHref, whatsappHref } from "@/lib/listings"
import { cn } from "@/lib/utils"

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "size-4"}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.454.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.076 1.758-.712 2.006-1.413.248-.709.248-1.289.173-1.413-.074-.124-.272-.198-.57-.673m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.34-.17A9.86 9.86 0 013.1 9.9a9.88 9.88 0 0110.02-8.24 9.87 9.87 0 016.78 2.88 9.86 9.86 0 012.73 6.95 9.86 9.86 0 01-2.9 7.05 9.88 9.88 0 01-6.33 2.97z" />
    </svg>
  )
}

type ContactMethod = "WHATSAPP_PHONE" | "ALL" | "CHAT"

export function ListingContactBar({
  listingId,
  title,
  ownerName,
  ownerSlug,
  ownerKind,
  representativeName,
  representativeRole,
  phone,
  whatsapp,
  favorited,
  isDemo,
  signedIn = false,
  contactMethod,
}: {
  listingId: string
  title: string
  ownerName?: string | null
  ownerSlug?: string | null
  ownerKind?: AdvertiserKind | null
  representativeName?: string | null
  representativeRole?: "OWNER" | "AGENT" | null
  phone?: string | null
  whatsapp?: string | null
  favorited?: boolean
  isDemo?: boolean
  signedIn?: boolean
  contactMethod?: ContactMethod
}) {
  const wa = whatsapp || phone
  const call = phone || whatsapp

  // Default ALL so call/WhatsApp are not hidden when method unset (demos / legacy)
  const method: ContactMethod = contactMethod ?? "ALL"
  const showChat = method === "CHAT" || method === "ALL"
  const showWhatsApp = (method === "WHATSAPP_PHONE" || method === "ALL") && Boolean(wa)
  const showCall = (method === "WHATSAPP_PHONE" || method === "ALL") && Boolean(call)

  const router = useRouter()
  const pathname = usePathname()
  const [chatOpen, setChatOpen] = useState(false)
  const [chatContent, setChatContent] = useState("")
  const [chatError, setChatError] = useState<string | null>(null)
  const [chatPending, startChatTransition] = useTransition()

  const openChat = (e?: MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (isDemo) {
      window.alert("المراسلة متاحة للإعلانات المنشورة فعلياً بعد موافقة الإدارة.")
      return
    }
    setChatError(null)
    setChatOpen(true)
  }

  const openWhatsApp = () => {
    if (!wa) return
    if (isDemo) {
      window.alert("واتساب للعرض فقط في الإعلانات التجريبية.")
    }
    window.open(
      whatsappHref(wa, `مرحباً، بخصوص إعلان أغاراتي: ${title}`),
      "_blank",
      "noopener,noreferrer"
    )
  }

  const openCall = () => {
    if (!call) return
    if (isDemo) {
      window.alert("الاتصال للعرض فقط في الإعلانات التجريبية.")
    }
    window.open(telHref(call), "_self")
  }

  const submitChat = () => {
    const trimmed = chatContent.trim()
    if (!trimmed) {
      setChatError("اكتب رسالتك أولاً.")
      return
    }
    startChatTransition(async () => {
      const fd = new FormData()
      fd.set("listingId", listingId)
      fd.set("content", trimmed)
      const result = await sendMessageAction({}, fd)
      if (result.code === "UNAUTHORIZED") {
        setChatOpen(false)
        router.push(
          `/login?next=${encodeURIComponent(pathname || `/properties/${listingId}`)}`
        )
        return
      }
      if (result.error) {
        setChatError(result.error)
        return
      }
      setChatContent("")
      setChatOpen(false)
      router.push(`/dashboard/messages/${listingId}`)
      router.refresh()
    })
  }

  const actionCount =
    Number(showChat) + Number(showWhatsApp) + Number(showCall)

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 md:static md:bottom-auto">
      <div
        className={cn(
          "border-t px-3 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2",
          "border-white/25",
          "bg-white/25",
          "shadow-[0_-6px_20px_rgba(15,39,68,0.04)]",
          "backdrop-blur-[6px]",
          "md:border md:border-white/20 md:rounded-2xl md:bg-white/15 md:p-2.5 md:shadow-[0_8px_24px_rgba(15,39,68,0.06)] md:backdrop-blur-md"
        )}
      >
        <div className="mx-auto max-w-7xl space-y-1.5">
          <ListingAdvertiserLink
            name={ownerName}
            slug={ownerSlug}
            kind={ownerKind}
            representativeName={representativeName}
            representativeRole={representativeRole}
            isDemo={isDemo}
            compact
            showAvatar={false}
            className="w-full"
          />

          <div className="flex items-stretch gap-2.5">
            <div
              className={cn(
                "grid min-w-0 flex-1 gap-2",
                actionCount >= 3
                  ? "grid-cols-3"
                  : actionCount === 2
                    ? "grid-cols-2"
                    : "grid-cols-1"
              )}
            >
              {showChat ? (
                <button
                  type="button"
                  onClick={openChat}
                  className={cn(
                    "group relative inline-flex h-[3.05rem] flex-col items-center justify-center gap-0 overflow-hidden rounded-xl px-1.5",
                    "bg-[#0F2744] text-[#f8f1e6]",
                    "ring-1 ring-[color:var(--brand-gold)]/50",
                    "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_6px_16px_rgba(15,39,68,0.28)]",
                    "transition duration-200 hover:brightness-110 active:scale-[0.985]",
                    "md:bg-[linear-gradient(180deg,#c4a574_0%,#B8956C_45%,#9a7a52_100%)] md:text-[#0F2744] md:ring-[color:var(--brand-gold)]/40"
                  )}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-l from-transparent via-[color:var(--brand-gold)] to-transparent md:via-white/50"
                  />
                  <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold tracking-wide">
                    <MessageSquare className="size-4 opacity-95" strokeWidth={1.75} />
                    مراسلة
                  </span>
                  <span className="text-[0.52rem] font-medium tracking-wider opacity-70">
                    عبر أغاراتي
                  </span>
                </button>
              ) : null}

              {showWhatsApp ? (
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className={cn(
                    "inline-flex h-[3.05rem] flex-col items-center justify-center gap-0 rounded-xl px-1.5",
                    "bg-[#fffdf9] text-[#0F2744]",
                    "ring-1 ring-[#0F2744]/12",
                    "shadow-[0_4px_14px_rgba(15,39,68,0.08)]",
                    "transition duration-200 hover:ring-[color:var(--brand-gold)]/55 hover:shadow-[0_6px_18px_rgba(15,39,68,0.12)] active:scale-[0.985]",
                    "md:bg-[#fffdf9]/90 md:text-[#0F2744] md:ring-[#0F2744]/10 md:hover:ring-[color:var(--brand-gold)]/50"
                  )}
                >
                  <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold tracking-wide">
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#1f6b4a]/12 text-[#1f6b4a]">
                      <WhatsAppIcon className="size-3.5" />
                    </span>
                    واتساب
                  </span>
                  <span className="text-[0.52rem] font-medium tracking-wider text-[#6B6560]">
                    رسالة مباشرة
                  </span>
                </button>
              ) : null}

              {showCall ? (
                <button
                  type="button"
                  onClick={openCall}
                  className={cn(
                    "inline-flex h-[3.05rem] flex-col items-center justify-center gap-0 rounded-xl px-1.5",
                    "bg-[#fffdf9] text-[#0F2744]",
                    "ring-1 ring-[#0F2744]/12",
                    "shadow-[0_4px_14px_rgba(15,39,68,0.08)]",
                    "transition duration-200 hover:ring-[color:var(--brand-gold)]/55 hover:shadow-[0_6px_18px_rgba(15,39,68,0.12)] active:scale-[0.985]",
                    "md:bg-[#fffdf9]/90 md:text-[#0F2744] md:ring-[#0F2744]/10 md:hover:ring-[color:var(--brand-gold)]/50"
                  )}
                >
                  <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold tracking-wide">
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-[color:var(--brand-gold)]/18 text-[color:var(--brand-gold)]">
                      <Phone className="size-3.5" strokeWidth={1.85} />
                    </span>
                    اتصال
                  </span>
                  <span className="text-[0.52rem] font-medium tracking-wider text-[#6B6560]">
                    اتصال هاتفي
                  </span>
                </button>
              ) : null}
            </div>

            <ListingFavoriteButton
              listingId={listingId}
              favorited={favorited}
              isDemo={isDemo}
              signedIn={signedIn}
              size="icon"
              className={cn(
                "size-[3.05rem] shrink-0 rounded-xl",
                "border border-[color:var(--brand-gold)]/40 bg-[#fffdf9] text-[#0F2744]",
                "shadow-[0_4px_14px_rgba(15,39,68,0.08)]",
                "hover:border-[color:var(--brand-gold)] hover:bg-[#faf6ef] hover:text-[color:var(--brand-gold)]",
                "md:border-[color:var(--brand-gold)]/35 md:bg-[#fffdf9]/90 md:text-[#0F2744] md:hover:border-[color:var(--brand-gold)] md:hover:bg-[#faf6ef] md:hover:text-[color:var(--brand-gold)]"
              )}
            />
          </div>
        </div>
      </div>

      {chatOpen ? (
        <ListingMessageSheet
          open={chatOpen}
          onOpenChange={setChatOpen}
          listingTitle={title}
          content={chatContent}
          onContentChange={(value) => {
            setChatContent(value)
            if (chatError) setChatError(null)
          }}
          error={chatError}
          pending={chatPending}
          onSubmit={submitChat}
        />
      ) : null}
    </div>
  )
}

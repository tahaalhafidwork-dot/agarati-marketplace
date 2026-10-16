export type ContactMethod = "WHATSAPP_PHONE" | "ALL" | "CHAT"

export type ListingActionState = {
  error?: string
  success?: string
  listingId?: string
}

export type { ThreadMessageDto } from "@/application/listings/messages/count-unread"

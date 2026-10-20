import { unstable_noStore as noStore } from "next/cache"

import { isDatabaseConfigured, isDatabaseReachable, prisma } from "@/lib/db"

export async function countUnreadMessages(userId: string): Promise<number> {
  noStore()
  if (!isDatabaseConfigured() || !userId) return 0
  if (!(await isDatabaseReachable())) return 0
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })
    const [listingUnread, requestUnread, agencyInvitations] = await Promise.all([
      prisma.message.count({
        where: { toId: userId, readAt: null },
      }),
      prisma.propertyRequestMessage.count({
        where: { toId: userId, readAt: null },
      }),
      prisma.agencyInvitation.count({
        where: {
          status: "PENDING",
          expiresAt: { gt: new Date() },
          OR: [
            { invitedUserId: userId },
            ...(user?.email
              ? [{ emailNormalized: user.email.trim().toLowerCase() }]
              : []),
          ],
        },
      }),
    ])
    return listingUnread + requestUnread + agencyInvitations
  } catch {
    return 0
  }
}

export type ThreadMessageDto = {
  id: string
  content: string
  fromId: string
  fromName: string
  createdAt: string
}

export async function isListingMessageParticipant(
  listingId: string,
  userId: string
) {
  const msg = await prisma.message.findFirst({
    where: {
      listingId,
      OR: [{ fromId: userId }, { toId: userId }],
    },
    select: { id: true },
  })
  return !!msg
}

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('WHATSAPP', 'PHONE', 'CHAT');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "contactMethod" "ContactMethod" DEFAULT 'CHAT';

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_listingId_createdAt_idx" ON "Message"("listingId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_fromId_createdAt_idx" ON "Message"("fromId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_toId_createdAt_idx" ON "Message"("toId", "createdAt");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "listingNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Listing_listingNumber_key" ON "Listing"("listingNumber");
-- AlterEnum
ALTER TYPE "ListingStatus" ADD VALUE 'EXPIRED';

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "agencyLogoUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "agencySocialUrl" TEXT;

-- AlterTable Listing
ALTER TABLE "Listing" ADD COLUMN "expiresAt" TIMESTAMP(3);
ALTER TABLE "Listing" ADD COLUMN "visibilityPaused" BOOLEAN NOT NULL DEFAULT false;

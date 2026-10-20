-- AlterTable Project
ALTER TABLE "Project"
  ADD COLUMN IF NOT EXISTS "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

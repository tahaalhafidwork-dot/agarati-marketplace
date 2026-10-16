-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable Project
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "status" "ProjectStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "summary" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "websiteUrl" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Project_status_createdAt_idx" ON "Project"("status", "createdAt");

-- AlterTable AgencyProject
ALTER TABLE "AgencyProject" ADD COLUMN IF NOT EXISTS "isOfficialSalesDesk" BOOLEAN NOT NULL DEFAULT false;

-- Promote seeded projects + curated covers / blurbs
UPDATE "Project" SET
  "status" = 'APPROVED',
  "reviewedAt" = CURRENT_TIMESTAMP,
  "imageUrl" = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  "summary" = 'مجمّع سكني حديث بطابع حضري، وحدات متنوعة ومرافق خدمية ضمن بيئة مخطّطة.'
WHERE "slug" = 'flora-city';

UPDATE "Project" SET
  "status" = 'APPROVED',
  "reviewedAt" = CURRENT_TIMESTAMP,
  "imageUrl" = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  "summary" = 'مجمّع بختياري — وحدات سكنية في موقع حيوي بأربيل، مناسب للعوائل والاستثمار.'
WHERE "slug" = 'bakhtyari-complex';

UPDATE "Project" SET
  "status" = 'APPROVED',
  "reviewedAt" = CURRENT_TIMESTAMP,
  "imageUrl" = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  "summary" = 'مجمّع كسنزان السكني — بيئة هادئة مع خدمات قريبة ومساحات خضراء.'
WHERE "slug" = 'kesnazan-compound';

UPDATE "Project" SET
  "status" = 'APPROVED',
  "reviewedAt" = CURRENT_TIMESTAMP,
  "imageUrl" = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  "summary" = 'مجمّع المنصور السكني في بغداد — وحدات بمواصفات عصرية قرب المحاور الرئيسية.'
WHERE "slug" = 'al-jadriya-compound';

UPDATE "Project" SET
  "status" = 'APPROVED',
  "reviewedAt" = CURRENT_TIMESTAMP,
  "imageUrl" = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  "summary" = 'فلل اليرموك — وحدات مستقلة بمساحات واسعة في حي راقٍ.'
WHERE "slug" = 'yarmouk-villas';

UPDATE "Project" SET
  "status" = 'APPROVED',
  "reviewedAt" = CURRENT_TIMESTAMP,
  "imageUrl" = 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80',
  "summary" = 'سيتي سنتر — وجهة مختلطة تجمع التسوق والسكن في موقع مركزي بالسليمانية.'
WHERE "slug" = 'city-center-mall';

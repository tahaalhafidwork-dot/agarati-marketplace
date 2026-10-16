-- ProjectKind: residential directory vs commercial-only (malls)
DO $$ BEGIN
  CREATE TYPE "ProjectKind" AS ENUM ('RESIDENTIAL', 'MIXED_USE', 'COMMERCIAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "projectKind" "ProjectKind" NOT NULL DEFAULT 'RESIDENTIAL';

-- Columns/enums from project_moderation sort later alphabetically — bootstrap on fresh DBs
DO $$ BEGIN
  CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "status" "ProjectStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "summary" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "websiteUrl" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Project_projectKind_status_idx" ON "Project"("projectKind", "status");

-- Classify seeded / known slugs
UPDATE "Project" SET "projectKind" = 'MIXED_USE' WHERE "slug" = 'empire-world';
UPDATE "Project" SET "projectKind" = 'RESIDENTIAL' WHERE "slug" IN (
  'flora-city',
  'bakhtyari-complex',
  'kesnazan-compound',
  'al-jadriya-compound',
  'yarmouk-villas',
  'amwaj-towers'
);
UPDATE "Project" SET "projectKind" = 'COMMERCIAL' WHERE "slug" IN (
  'family-mall-erbil',
  'majidi-mall',
  'city-center-mall'
);

-- Drop pure shopping centers from the residential projects directory
DELETE FROM "Project" WHERE "slug" IN ('family-mall-erbil', 'majidi-mall');

UPDATE "Project" SET
  "summary" = 'مجمّع سكني — فلوريا ستي في أربيل (مجمّع مخطّط).'
WHERE "slug" = 'flora-city';

UPDATE "Project" SET
  "summary" = 'مجمّع سكني — بختياري في أربيل.'
WHERE "slug" = 'bakhtyari-complex';

UPDATE "Project" SET
  "summary" = 'مجمّع سكني — كسنزان.'
WHERE "slug" = 'kesnazan-compound';

UPDATE "Project" SET
  "summary" = 'مجمّع سكني — المنصور / الجادرية، بغداد.'
WHERE "slug" = 'al-jadriya-compound';

UPDATE "Project" SET
  "summary" = 'فلل سكنية — حي اليرموك، بغداد.'
WHERE "slug" = 'yarmouk-villas';

-- AlterTable User — agency public location + bio
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agencyCitySlug" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agencyDistrictSlug" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agencyNeighborhoodSlug" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agencyAddressLine" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agencyBio" TEXT;

-- CreateTable Project
CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "citySlug" TEXT,
    "districtSlug" TEXT,
    "neighborhoodSlug" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Project_slug_key" ON "Project"("slug");
CREATE INDEX IF NOT EXISTS "Project_name_idx" ON "Project"("name");
CREATE INDEX IF NOT EXISTS "Project_citySlug_idx" ON "Project"("citySlug");

-- CreateTable AgencyProject
CREATE TABLE IF NOT EXISTS "AgencyProject" (
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgencyProject_pkey" PRIMARY KEY ("userId","projectId")
);

CREATE INDEX IF NOT EXISTS "AgencyProject_projectId_idx" ON "AgencyProject"("projectId");

DO $$ BEGIN
  ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AgencyProject" ADD CONSTRAINT "AgencyProject_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AgencyProject" ADD CONSTRAINT "AgencyProject_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed example projects (idempotent)
INSERT INTO "Project" ("id", "slug", "name", "citySlug", "districtSlug", "neighborhoodSlug", "updatedAt")
VALUES
  ('seed_proj_flora_city', 'flora-city', 'فلوريا ستي', 'erbil', NULL, NULL, CURRENT_TIMESTAMP),
  ('seed_proj_bakhtyari', 'bakhtyari-complex', 'مجمع بختياري', 'erbil', NULL, NULL, CURRENT_TIMESTAMP),
  ('seed_proj_kesnazan', 'kesnazan-compound', 'مجمع كسنزان السكني', 'erbil', NULL, NULL, CURRENT_TIMESTAMP),
  ('seed_proj_jadriya', 'al-jadriya-compound', 'مجمع المنصور السكني', 'baghdad', NULL, NULL, CURRENT_TIMESTAMP),
  ('seed_proj_yarmouk', 'yarmouk-villas', 'فلل اليرموك', 'baghdad', NULL, NULL, CURRENT_TIMESTAMP),
  ('seed_proj_city_center', 'city-center-mall', 'سيتي سنتر', 'sulaymaniyah', NULL, NULL, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

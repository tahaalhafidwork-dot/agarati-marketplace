-- Soft-archive for projects + proposed complex name on listings
-- Create enum here because this migration sorts before project_moderation on fresh DBs.
DO $$ BEGIN
  CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "proposedComplexName" TEXT;

-- CreateTable ProjectPhoto
CREATE TABLE IF NOT EXISTS "ProjectPhoto" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PENDING',
    "contributorId" TEXT,
    "contributorName" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectPhoto_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProjectPhoto_projectId_status_createdAt_idx"
  ON "ProjectPhoto"("projectId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "ProjectPhoto_status_createdAt_idx"
  ON "ProjectPhoto"("status", "createdAt");

DO $$ BEGIN
  ALTER TABLE "ProjectPhoto" ADD CONSTRAINT "ProjectPhoto_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ProjectPhoto" ADD CONSTRAINT "ProjectPhoto_contributorId_fkey"
    FOREIGN KEY ("contributorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

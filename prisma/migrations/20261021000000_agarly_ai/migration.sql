-- Agarly AI quota/audit ledger. Raw user prompts are intentionally not stored.
CREATE TYPE "AgarlySearchStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

CREATE TABLE "AgarlySearchUsage" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "promptHash" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "status" "AgarlySearchStatus" NOT NULL DEFAULT 'PROCESSING',
  "filters" JSONB,
  "errorCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "AgarlySearchUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AgarlySearchUsage_requestId_key"
  ON "AgarlySearchUsage"("requestId");
CREATE INDEX "AgarlySearchUsage_userId_createdAt_idx"
  ON "AgarlySearchUsage"("userId", "createdAt");
CREATE INDEX "AgarlySearchUsage_status_createdAt_idx"
  ON "AgarlySearchUsage"("status", "createdAt");

ALTER TABLE "AgarlySearchUsage"
  ADD CONSTRAINT "AgarlySearchUsage_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Prisma connects as the trusted application role. No Data API policy is
-- granted, so the ledger cannot be read or written directly from a browser.
ALTER TABLE "AgarlySearchUsage" ENABLE ROW LEVEL SECURITY;

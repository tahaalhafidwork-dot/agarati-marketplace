-- Align Production DB with current prisma/schema.prisma
-- Root cause: schema evolved without migrations for these objects.
-- Intentionally omits User.loginPassword (plaintext password — removed from app).

-- ========== Enums ==========
DO $$ BEGIN
  CREATE TYPE "AccountType" AS ENUM ('INDIVIDUAL', 'AGENCY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AgencyUpgradeStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PropertyRequestStatus" AS ENUM ('PENDING', 'OPEN', 'FULFILLED', 'CLOSED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReportKind" AS ENUM (
    'MISLEADING_LISTING', 'FRAUD', 'ILLEGAL_CONTENT',
    'IMPERSONATION', 'TECHNICAL', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReportStatus" AS ENUM ('NEW', 'REVIEWING', 'RESOLVED', 'DISMISSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ContactMethod: DB has WHATSAPP/PHONE/CHAT; code expects WHATSAPP_PHONE/ALL/CHAT
CREATE TYPE "ContactMethod_new" AS ENUM ('WHATSAPP_PHONE', 'ALL', 'CHAT');

ALTER TABLE "Listing" ALTER COLUMN "contactMethod" DROP DEFAULT;

ALTER TABLE "Listing"
  ALTER COLUMN "contactMethod" TYPE "ContactMethod_new"
  USING (
    CASE "contactMethod"::text
      WHEN 'WHATSAPP' THEN 'WHATSAPP_PHONE'::"ContactMethod_new"
      WHEN 'PHONE' THEN 'WHATSAPP_PHONE'::"ContactMethod_new"
      WHEN 'WHATSAPP_PHONE' THEN 'WHATSAPP_PHONE'::"ContactMethod_new"
      WHEN 'ALL' THEN 'ALL'::"ContactMethod_new"
      ELSE 'CHAT'::"ContactMethod_new"
    END
  );

DROP TYPE "ContactMethod";
ALTER TYPE "ContactMethod_new" RENAME TO "ContactMethod";
ALTER TABLE "Listing" ALTER COLUMN "contactMethod" SET DEFAULT 'CHAT'::"ContactMethod";

-- ========== User columns ==========
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyMessages" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyOther" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accountType" "AccountType" NOT NULL DEFAULT 'INDIVIDUAL';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agencyUpgradeStatus" "AgencyUpgradeStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agencyOfficeName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agencyRequestNote" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agencyRequestedAt" TIMESTAMP(3);

-- ========== Listing columns ==========
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "mapLat" DOUBLE PRECISION;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "mapLng" DOUBLE PRECISION;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "services" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;

-- ========== SavedSearch ==========
CREATE TABLE IF NOT EXISTS "SavedSearch" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "href" TEXT NOT NULL,
  "queryKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SavedSearch_userId_queryKey_key" ON "SavedSearch"("userId", "queryKey");
CREATE INDEX IF NOT EXISTS "SavedSearch_userId_createdAt_idx" ON "SavedSearch"("userId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ========== PropertyRequest ==========
CREATE TABLE IF NOT EXISTS "PropertyRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" "PropertyCategory",
  "deal" "DealType",
  "citySlug" TEXT,
  "districtSlug" TEXT,
  "neighborhoodSlug" TEXT,
  "rooms" TEXT,
  "minBudgetIqd" INTEGER,
  "maxBudgetIqd" INTEGER,
  "minAreaM2" INTEGER,
  "maxAreaM2" INTEGER,
  "status" "PropertyRequestStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PropertyRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PropertyRequest_status_createdAt_idx" ON "PropertyRequest"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "PropertyRequest_userId_createdAt_idx" ON "PropertyRequest"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "PropertyRequest_citySlug_category_deal_status_idx"
  ON "PropertyRequest"("citySlug", "category", "deal", "status");

DO $$ BEGIN
  ALTER TABLE "PropertyRequest" ADD CONSTRAINT "PropertyRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ========== PropertyRequestMessage ==========
CREATE TABLE IF NOT EXISTS "PropertyRequestMessage" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "fromId" TEXT NOT NULL,
  "toId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PropertyRequestMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PropertyRequestMessage_requestId_createdAt_idx"
  ON "PropertyRequestMessage"("requestId", "createdAt");
CREATE INDEX IF NOT EXISTS "PropertyRequestMessage_fromId_createdAt_idx"
  ON "PropertyRequestMessage"("fromId", "createdAt");
CREATE INDEX IF NOT EXISTS "PropertyRequestMessage_toId_createdAt_idx"
  ON "PropertyRequestMessage"("toId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "PropertyRequestMessage" ADD CONSTRAINT "PropertyRequestMessage_requestId_fkey"
    FOREIGN KEY ("requestId") REFERENCES "PropertyRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "PropertyRequestMessage" ADD CONSTRAINT "PropertyRequestMessage_fromId_fkey"
    FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ========== Report ==========
CREATE TABLE IF NOT EXISTS "Report" (
  "id" TEXT NOT NULL,
  "referenceCode" TEXT NOT NULL,
  "kind" "ReportKind" NOT NULL,
  "status" "ReportStatus" NOT NULL DEFAULT 'NEW',
  "description" TEXT NOT NULL,
  "listingRef" TEXT,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "reporterUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Report_referenceCode_key" ON "Report"("referenceCode");
CREATE INDEX IF NOT EXISTS "Report_status_createdAt_idx" ON "Report"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Report_kind_createdAt_idx" ON "Report"("kind", "createdAt");

DO $$ BEGIN
  ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterUserId_fkey"
    FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

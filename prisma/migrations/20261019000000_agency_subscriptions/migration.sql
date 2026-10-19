-- AGARATİ agency memberships, subscriptions and listing billing.
-- This migration is intentionally additive. It does not alter the legacy
-- agency columns on "User", so existing accounts and URLs remain compatible.

CREATE TYPE "AgencyStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED');
CREATE TYPE "AgencyMemberRole" AS ENUM ('OWNER', 'AGENT');
CREATE TYPE "AgencyMembershipStatus" AS ENUM ('ACTIVE', 'LEFT');
CREATE TYPE "AgencyQuotaMode" AS ENUM ('EQUAL', 'MANUAL');
CREATE TYPE "AgencyInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'REVOKED', 'EXPIRED');
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');
CREATE TYPE "PaymentPurpose" AS ENUM ('INDIVIDUAL_LISTING', 'AGENCY_SUBSCRIPTION');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "ListingBillingKind" AS ENUM ('PERSONAL_FREE', 'PERSONAL_PAID', 'AGENCY_INCLUDED');
CREATE TYPE "ListingBillingState" AS ENUM ('READY', 'PAYMENT_REQUIRED', 'SUBSCRIPTION_REQUIRED');

ALTER TABLE "Listing"
  ADD COLUMN "agencyId" TEXT,
  ADD COLUMN "assignedAgentId" TEXT,
  ADD COLUMN "billingKind" "ListingBillingKind" NOT NULL DEFAULT 'PERSONAL_FREE',
  ADD COLUMN "billingState" "ListingBillingState" NOT NULL DEFAULT 'READY',
  ADD COLUMN "moderationApprovedAt" TIMESTAMP(3);

CREATE TABLE "Agency" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "AgencyStatus" NOT NULL DEFAULT 'PENDING',
  "quotaMode" "AgencyQuotaMode" NOT NULL DEFAULT 'EQUAL',
  "logoUrl" TEXT,
  "coverUrl" TEXT,
  "bio" TEXT,
  "phone" TEXT,
  "whatsapp" TEXT,
  "websiteUrl" TEXT,
  "instagramUrl" TEXT,
  "facebookUrl" TEXT,
  "citySlug" TEXT,
  "districtSlug" TEXT,
  "neighborhoodSlug" TEXT,
  "addressLine" TEXT,
  "mapLat" DOUBLE PRECISION,
  "mapLng" DOUBLE PRECISION,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgencyMembership" (
  "id" TEXT NOT NULL,
  "agencyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "AgencyMemberRole" NOT NULL,
  "status" "AgencyMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
  "manualQuota" INTEGER NOT NULL DEFAULT 0,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leftAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AgencyMembership_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgencyMembership_manualQuota_check" CHECK ("manualQuota" BETWEEN 0 AND 30)
);

CREATE TABLE "AgencyInvitation" (
  "id" TEXT NOT NULL,
  "agencyId" TEXT NOT NULL,
  "emailNormalized" TEXT NOT NULL,
  "invitedUserId" TEXT,
  "invitedById" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "status" "AgencyInvitationStatus" NOT NULL DEFAULT 'PENDING',
  "manualQuota" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AgencyInvitation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgencyInvitation_manualQuota_check" CHECK ("manualQuota" BETWEEN 0 AND 30)
);

CREATE TABLE "AgencySubscription" (
  "id" TEXT NOT NULL,
  "agencyId" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "priceIqd" INTEGER NOT NULL DEFAULT 40000,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AgencySubscription_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgencySubscription_price_check" CHECK ("priceIqd" >= 0),
  CONSTRAINT "AgencySubscription_period_check" CHECK ("endsAt" > "startsAt")
);

CREATE TABLE "PaymentRequest" (
  "id" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "purpose" "PaymentPurpose" NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amountIqd" INTEGER NOT NULL,
  "listingId" TEXT,
  "agencyId" TEXT,
  "requestedById" TEXT NOT NULL,
  "approvedById" TEXT,
  "externalReference" TEXT,
  "rejectionReason" TEXT,
  "approvedAt" TIMESTAMP(3),
  "appliedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PaymentRequest_amount_check" CHECK ("amountIqd" >= 0),
  CONSTRAINT "PaymentRequest_price_check" CHECK (
    ("purpose" = 'INDIVIDUAL_LISTING' AND "amountIqd" = 5000)
    OR
    ("purpose" = 'AGENCY_SUBSCRIPTION' AND "amountIqd" = 40000)
  ),
  CONSTRAINT "PaymentRequest_target_check" CHECK (
    ("purpose" = 'INDIVIDUAL_LISTING' AND "listingId" IS NOT NULL AND "agencyId" IS NULL)
    OR
    ("purpose" = 'AGENCY_SUBSCRIPTION' AND "agencyId" IS NOT NULL AND "listingId" IS NULL)
  )
);

CREATE UNIQUE INDEX "Agency_slug_key" ON "Agency"("slug");
CREATE INDEX "Agency_status_name_idx" ON "Agency"("status", "name");
CREATE INDEX "Agency_citySlug_districtSlug_neighborhoodSlug_idx" ON "Agency"("citySlug", "districtSlug", "neighborhoodSlug");
CREATE INDEX "Agency_createdById_idx" ON "Agency"("createdById");

CREATE INDEX "AgencyMembership_userId_status_idx" ON "AgencyMembership"("userId", "status");
CREATE INDEX "AgencyMembership_agencyId_status_role_idx" ON "AgencyMembership"("agencyId", "status", "role");
CREATE UNIQUE INDEX "AgencyMembership_agencyId_userId_key" ON "AgencyMembership"("agencyId", "userId");
CREATE UNIQUE INDEX "AgencyMembership_one_active_owner_idx"
  ON "AgencyMembership"("agencyId")
  WHERE "status" = 'ACTIVE' AND "role" = 'OWNER';
CREATE UNIQUE INDEX "AgencyMembership_one_active_agency_per_user_idx"
  ON "AgencyMembership"("userId")
  WHERE "status" = 'ACTIVE';

CREATE UNIQUE INDEX "AgencyInvitation_tokenHash_key" ON "AgencyInvitation"("tokenHash");
CREATE INDEX "AgencyInvitation_agencyId_status_createdAt_idx" ON "AgencyInvitation"("agencyId", "status", "createdAt");
CREATE INDEX "AgencyInvitation_emailNormalized_status_idx" ON "AgencyInvitation"("emailNormalized", "status");
CREATE INDEX "AgencyInvitation_invitedUserId_status_idx" ON "AgencyInvitation"("invitedUserId", "status");
CREATE UNIQUE INDEX "AgencyInvitation_one_pending_email_idx"
  ON "AgencyInvitation"("agencyId", "emailNormalized")
  WHERE "status" = 'PENDING';

CREATE UNIQUE INDEX "AgencySubscription_paymentId_key" ON "AgencySubscription"("paymentId");
CREATE INDEX "AgencySubscription_agencyId_status_endsAt_idx" ON "AgencySubscription"("agencyId", "status", "endsAt");

CREATE UNIQUE INDEX "PaymentRequest_idempotencyKey_key" ON "PaymentRequest"("idempotencyKey");
CREATE UNIQUE INDEX "PaymentRequest_externalReference_key" ON "PaymentRequest"("externalReference");
CREATE INDEX "PaymentRequest_status_createdAt_idx" ON "PaymentRequest"("status", "createdAt");
CREATE INDEX "PaymentRequest_requestedById_status_createdAt_idx" ON "PaymentRequest"("requestedById", "status", "createdAt");
CREATE INDEX "PaymentRequest_listingId_status_idx" ON "PaymentRequest"("listingId", "status");
CREATE INDEX "PaymentRequest_agencyId_status_idx" ON "PaymentRequest"("agencyId", "status");

CREATE INDEX "Listing_agencyId_status_expiresAt_idx" ON "Listing"("agencyId", "status", "expiresAt");
CREATE INDEX "Listing_assignedAgentId_status_idx" ON "Listing"("assignedAgentId", "status");
CREATE INDEX "Listing_ownerId_billingKind_createdAt_idx" ON "Listing"("ownerId", "billingKind", "createdAt");

ALTER TABLE "Listing" ADD CONSTRAINT "Listing_agencyId_fkey"
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_assignedAgentId_fkey"
  FOREIGN KEY ("assignedAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_billing_owner_check" CHECK (
  ("agencyId" IS NULL AND "billingKind" IN ('PERSONAL_FREE', 'PERSONAL_PAID'))
  OR
  ("agencyId" IS NOT NULL AND "billingKind" = 'AGENCY_INCLUDED')
);
ALTER TABLE "Agency" ADD CONSTRAINT "Agency_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgencyMembership" ADD CONSTRAINT "AgencyMembership_agencyId_fkey"
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgencyMembership" ADD CONSTRAINT "AgencyMembership_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgencyInvitation" ADD CONSTRAINT "AgencyInvitation_agencyId_fkey"
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgencyInvitation" ADD CONSTRAINT "AgencyInvitation_invitedUserId_fkey"
  FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AgencyInvitation" ADD CONSTRAINT "AgencyInvitation_invitedById_fkey"
  FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgencySubscription" ADD CONSTRAINT "AgencySubscription_agencyId_fkey"
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgencySubscription" ADD CONSTRAINT "AgencySubscription_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "PaymentRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_agencyId_fkey"
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_requestedById_fkey"
  FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_approvedById_fkey"
  FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate every previously approved legacy agency to the new entity while
-- keeping the existing /agencies/u-{userId} URL stable.
INSERT INTO "Agency" (
  "id", "slug", "name", "status", "quotaMode", "logoUrl", "bio", "phone",
  "whatsapp", "instagramUrl", "citySlug", "districtSlug", "neighborhoodSlug",
  "addressLine", "createdById", "createdAt", "updatedAt"
)
SELECT
  'legacy-agency-' || u."id",
  'u-' || u."id",
  COALESCE(NULLIF(BTRIM(u."agencyOfficeName"), ''), u."name"),
  'APPROVED'::"AgencyStatus",
  'EQUAL'::"AgencyQuotaMode",
  u."agencyLogoUrl",
  u."agencyBio",
  u."phone",
  u."whatsapp",
  u."agencySocialUrl",
  u."agencyCitySlug",
  u."agencyDistrictSlug",
  u."agencyNeighborhoodSlug",
  u."agencyAddressLine",
  u."id",
  u."createdAt",
  CURRENT_TIMESTAMP
FROM "User" u
WHERE u."accountType" = 'AGENCY' OR u."agencyUpgradeStatus" = 'APPROVED'
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "AgencyMembership" (
  "id", "agencyId", "userId", "role", "status", "manualQuota",
  "joinedAt", "createdAt", "updatedAt"
)
SELECT
  'legacy-owner-' || a."createdById",
  a."id",
  a."createdById",
  'OWNER'::"AgencyMemberRole",
  'ACTIVE'::"AgencyMembershipStatus",
  30,
  a."createdAt",
  a."createdAt",
  CURRENT_TIMESTAMP
FROM "Agency" a
ON CONFLICT ("agencyId", "userId") DO NOTHING;

UPDATE "Listing" l
SET
  "agencyId" = a."id",
  "assignedAgentId" = l."ownerId",
  "billingKind" = 'AGENCY_INCLUDED'::"ListingBillingKind",
  "billingState" = 'READY'::"ListingBillingState"
FROM "Agency" a
WHERE a."createdById" = l."ownerId";

-- Preserve exactly one perpetual free personal listing per user. Other
-- existing personal listings stay published until their current expiry and
-- become paid only on their next renewal.
WITH ranked_personal AS (
  SELECT
    l."id",
    ROW_NUMBER() OVER (
      PARTITION BY l."ownerId"
      ORDER BY l."createdAt" ASC, l."id" ASC
    ) AS position
  FROM "Listing" l
  WHERE l."agencyId" IS NULL
)
UPDATE "Listing" l
SET "billingKind" = CASE
  WHEN r.position = 1 THEN 'PERSONAL_FREE'::"ListingBillingKind"
  ELSE 'PERSONAL_PAID'::"ListingBillingKind"
END
FROM ranked_personal r
WHERE r."id" = l."id";

CREATE UNIQUE INDEX "Listing_one_personal_free_per_owner_idx"
  ON "Listing"("ownerId")
  WHERE "agencyId" IS NULL AND "billingKind" = 'PERSONAL_FREE';

-- A 30-day transition subscription prevents currently published agency ads
-- from disappearing immediately when the new subscription gate is enabled.
INSERT INTO "PaymentRequest" (
  "id", "idempotencyKey", "purpose", "status", "amountIqd", "agencyId",
  "requestedById", "externalReference", "approvedAt", "appliedAt",
  "createdAt", "updatedAt"
)
SELECT
  'legacy-payment-' || a."id",
  'legacy-agency-transition:' || a."id",
  'AGENCY_SUBSCRIPTION'::"PaymentPurpose",
  'APPROVED'::"PaymentStatus",
  40000,
  a."id",
  a."createdById",
  'GRANDFATHERED-' || a."id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Agency" a
ON CONFLICT ("idempotencyKey") DO NOTHING;

INSERT INTO "AgencySubscription" (
  "id", "agencyId", "paymentId", "status", "priceIqd", "startsAt", "endsAt",
  "createdAt", "updatedAt"
)
SELECT
  'legacy-subscription-' || a."id",
  a."id",
  p."id",
  'ACTIVE'::"SubscriptionStatus",
  40000,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '30 days',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Agency" a
JOIN "PaymentRequest" p
  ON p."idempotencyKey" = 'legacy-agency-transition:' || a."id"
ON CONFLICT ("paymentId") DO NOTHING;

-- All access is mediated by authenticated Next.js server code. Enabling RLS
-- with no Data API policies prevents accidental direct exposure.
ALTER TABLE "Agency" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgencyMembership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgencyInvitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgencySubscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentRequest" ENABLE ROW LEVEL SECURITY;

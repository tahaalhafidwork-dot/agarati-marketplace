-- Keep the legacy text columns during the transition. New writes populate both
-- representations, while filtering uses these normalized numeric columns.
ALTER TABLE "Listing"
ADD COLUMN "roomCount" INTEGER,
ADD COLUMN "floorNumber" INTEGER,
ADD COLUMN "propertyFloors" INTEGER,
ADD COLUMN "buildingFloors" INTEGER;

-- Normalize Arabic-Indic and Eastern Arabic-Indic digits before extracting
-- the first room number (for example ٣+١ -> 3).
UPDATE "Listing"
SET "roomCount" = NULLIF(
  SUBSTRING(
    TRANSLATE(COALESCE("rooms", ''), '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹', '01234567890123456789')
    FROM '[0-9]+'
  ),
  ''
)::INTEGER
WHERE COALESCE("rooms", '') ~ '[0-9٠-٩۰-۹]';

-- Apartments and offices use the first number as their unit floor and, for
-- legacy values such as ٦ / ١٢, the second number as total building floors.
UPDATE "Listing"
SET
  "floorNumber" = CASE
    WHEN "floor" = 'أرضي' THEN 0
    WHEN COALESCE("floor", '') ~ '[0-9٠-٩۰-۹]'
      THEN (REGEXP_MATCH(
        TRANSLATE("floor", '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹', '01234567890123456789'),
        '-?[0-9]+'
      ))[1]::INTEGER
    ELSE NULL
  END,
  "buildingFloors" = CASE
    WHEN COALESCE("floor", '') LIKE '%/%'
      THEN (REGEXP_MATCH(
        TRANSLATE("floor", '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹', '01234567890123456789'),
        '/[^0-9]*([0-9]+)'
      ))[1]::INTEGER
    ELSE NULL
  END,
  "propertyFloors" = CASE
    WHEN COALESCE("floor", '') LIKE '%تربلكس%'
      OR COALESCE("floor", '') LIKE '%ثلاثي%' THEN 3
    WHEN COALESCE("floor", '') LIKE '%دوبلكس%' THEN 2
    ELSE 1
  END
WHERE "category" IN ('APARTMENT', 'OFFICE');

-- For detached houses, villas and whole buildings, the legacy floor text
-- described the number of levels occupied by the property itself.
UPDATE "Listing"
SET "propertyFloors" = CASE
  WHEN COALESCE("floor", '') LIKE '%تربلكس%'
    OR COALESCE("floor", '') LIKE '%ثلاثي%' THEN 3
  WHEN COALESCE("floor", '') LIKE '%دوبلكس%'
    OR COALESCE("floor", '') LIKE '%طابقان%' THEN 2
  WHEN COALESCE("floor", '') LIKE '%أرضي%'
    OR COALESCE("floor", '') LIKE '%مستقل%'
    OR COALESCE("floor", '') LIKE '%طابق واحد%' THEN 1
  WHEN COALESCE("floor", '') ~ '[0-9٠-٩۰-۹]'
    THEN (REGEXP_MATCH(
      TRANSLATE("floor", '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹', '01234567890123456789'),
      '[0-9]+'
    ))[1]::INTEGER
  ELSE NULL
END
WHERE "category" IN ('HOUSE', 'VILLA', 'BUILDING');

ALTER TABLE "Listing"
ADD CONSTRAINT "Listing_roomCount_range" CHECK ("roomCount" IS NULL OR "roomCount" BETWEEN 0 AND 20) NOT VALID,
ADD CONSTRAINT "Listing_floorNumber_range" CHECK ("floorNumber" IS NULL OR "floorNumber" BETWEEN -3 AND 60) NOT VALID,
ADD CONSTRAINT "Listing_propertyFloors_range" CHECK ("propertyFloors" IS NULL OR "propertyFloors" BETWEEN 1 AND 20) NOT VALID,
ADD CONSTRAINT "Listing_buildingFloors_range" CHECK ("buildingFloors" IS NULL OR "buildingFloors" BETWEEN 1 AND 60) NOT VALID,
ADD CONSTRAINT "Listing_floor_within_building" CHECK (
  "floorNumber" IS NULL
  OR "buildingFloors" IS NULL
  OR "floorNumber" < 0
  OR "floorNumber" <= "buildingFloors"
) NOT VALID,
ADD CONSTRAINT "Listing_property_floors_within_building" CHECK (
  "propertyFloors" IS NULL
  OR "buildingFloors" IS NULL
  OR "propertyFloors" <= "buildingFloors"
) NOT VALID;

CREATE INDEX "Listing_status_category_roomCount_idx"
ON "Listing"("status", "category", "roomCount");

CREATE INDEX "Listing_status_category_floorNumber_idx"
ON "Listing"("status", "category", "floorNumber");

CREATE INDEX "Listing_status_category_propertyFloors_idx"
ON "Listing"("status", "category", "propertyFloors");

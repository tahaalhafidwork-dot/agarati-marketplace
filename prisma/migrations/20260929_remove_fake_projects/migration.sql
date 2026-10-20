-- Remove invented / misnamed residential project entries
DELETE FROM "Project" WHERE "slug" IN (
  'kesnazan-compound',
  'al-jadriya-compound',
  'yarmouk-villas'
);

UPDATE "Project" SET
  "name" = 'فلوريا سيتي',
  "summary" = 'مشروع فلوريا سيتي السكني — طريق كوية، أربيل.'
WHERE "slug" = 'flora-city';

UPDATE "Project" SET
  "name" = 'بختياري توين تاورز',
  "summary" = 'بختياري توين تاورز — حي بختياري، أربيل (أبراج سكنية).'
WHERE "slug" = 'bakhtyari-complex';

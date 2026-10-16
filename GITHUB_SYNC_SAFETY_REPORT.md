# GitHub Synchronization Safety Audit

**التاريخ:** 2026-10-16  
**النطاق:** فحص وحماية فقط. لم يُنفذ `pull` أو `push` أو `fetch` أو `reset` أو `merge`، ولم تُجرَ تعديلات على قاعدة بيانات أو إعدادات Vercel أو ملفات التطبيق. أُنشئ هذا التقرير فقط.

## الخلاصة التنفيذية

- الفرع الحالي `mobile/foundation-phase-1` عند `c5dc222`، ولا يتتبع فرعًا بعيدًا. شجرة العمل فيها **62 ملفًا معدّلًا، و24 ملفًا غير متتبع، و0 staged، و0 محذوف** قبل إنشاء هذا التقرير.
- `origin/main` كما ظهر مباشرةً من GitHub عند `61332b8` (`Create README`). الفرع الحالي **متقدم 9 commits** عن `origin/main`، وغير متأخر عنه. كما أنه متقدم 8 commits عن `origin/cursor/sprint-0-foundation-5637` (`245d5bb`). لم يحدث `fetch`؛ المقارنة استخدمت `git ls-remote` للقراءة فقط ثم refs المحلية المطابقة.
- تغييرات العمل غير الملتزمة كبيرة وتشمل الويب والموبايل وPrisma وبيانات اختبار. لا تستخدم `git add -A` أو تنشر الشجرة كاملة قبل مراجعة الملفات الحساسة والمigrations.
- ربط `.vercel/project.json` يثبت ارتباط المجلد بمشروع Vercel فقط؛ لا يحتوي فرع الإنتاج أو commit منشور. لم يتوفر Vercel CLI أو `VERCEL_TOKEN`، ولم يُفحص Dashboard.
- لا يمكن إثبات SHA المنشور بدقة من المعلومات المتاحة. لكن فحص صفحة الإنتاج `/categories` في هذه الجلسة أظهر `مزارع واستراحات` بينما الشجرة المحلية تعرض `مزارع سياحية`، ما يثبت أن الإنتاج لا يعكس هذا التغيير المحلي غير الملتزم. لا يحدد ذلك أي commit بعينه.
- يوجد خطر مرتفع حول Prisma: ملف schema وثلاثة migrations تغيّرت/أضيفت، وتقرير QA الموجود يقول إنه لا يوجد تغيير schema. لم يُتصل بقاعدة البيانات ولم يُنفذ build في هذا التدقيق.

## حالة Git والـremote

- الفرع: `mobile/foundation-phase-1`، آخر commit: `c5dc222 Ship PWA prerequisites and Bubblewrap TWA Play packaging path.`
- upstream للفرع الحالي: غير مضبوط.
- الفروع المحلية الأخرى: `main` عند `61332b8` ويتتبع `origin/main`؛ `sprint-0` عند `245d5bb`؛ `baseline/current-working-state` عند `e3c1061`.
- فروع GitHub التي أعادها `git ls-remote --heads origin`:
  - `main` = `61332b8dcc18e5983c5a017d1738cd460cc8461a`
  - `cursor/sprint-0-foundation-5637` = `245d5bbc5821f291a1942a47a4e323aa71181fc8`
- نتائج `git rev-list --left-right --count`:
  - `origin/main...HEAD` = `0 9`
  - `origin/cursor/sprint-0-foundation-5637...HEAD` = `0 8`
- لا توجد تغييرات staged أو عمليات حذف في شجرة العمل. الفرق بين commits الفرع و`origin/main` يتضمن انتقال `README` إلى `README.md`؛ هذا ليس حذفًا غير ملتزم في الشجرة الحالية.
- `git diff --check` وجد مسافة زائدة في `components/search/listings-filter-fields.tsx` عند السطر 216.

## جرد شجرة العمل

### معدّلة: 62

```text
.gitignore
app/(public)/agencies/[slug]/page.tsx
app/(public)/categories/[[...path]]/page.tsx
app/(public)/page.tsx
app/(public)/properties/[slug]/page.tsx
app/admin/layout.tsx
app/admin/users/page.tsx
app/api/mobile/v1/auth/ensure-profile/route.ts
app/dashboard/layout.tsx
app/dashboard/messages/[listingId]/page.tsx
app/dashboard/page.tsx
app/dashboard/properties/page.tsx
application/favorites/toggle.ts
application/listings/browse-page.ts
apps/mobile/app.json
apps/mobile/assets/android-icon-background.png
apps/mobile/assets/android-icon-foreground.png
apps/mobile/assets/android-icon-monochrome.png
apps/mobile/assets/favicon.png
apps/mobile/assets/icon.png
apps/mobile/assets/splash-icon.png
apps/mobile/src/auth/AuthProvider.tsx
apps/mobile/src/lib/api.ts
apps/mobile/src/lib/labels.ts
components/admin/admin-user-credentials.tsx
components/admin/admin-users-list.tsx
components/browse/properties-browse-view.tsx
components/favorites/guest-favorites-sync.tsx
components/home/home-search-bar.tsx
components/layout/app-nav.tsx
components/layout/auth-user-menu.tsx
components/layout/site-header.tsx
components/listing-wizard/listing-wizard.tsx
components/listing-wizard/steps/publish-step.tsx
components/property-requests/property-request-filters.tsx
components/property/listing-favorite-button.tsx
components/property/listing-result-row.tsx
components/property/listing-share-button.tsx
components/property/property-card-placeholder.tsx
components/search/listings-filter-fields.tsx
components/support/report-form.tsx
docs/DECISIONS.md
lib/actions/admin-users.ts
lib/actions/auth.ts
lib/actions/listings/create-update.ts
lib/actions/listings/favorite.ts
lib/actions/listings/messages.ts
lib/actions/settings.ts
lib/admin-service.ts
lib/auth.ts
lib/db.ts
lib/deals.ts
lib/listing-quota.ts
lib/listing-service.ts
lib/sample-listings.ts
prisma/migrations/20260929_project_archive_complex/migration.sql
prisma/migrations/20260929_project_kind/migration.sql
prisma/schema.prisma
public/icons/icon-192.png
public/icons/icon-512.png
tools/create-approved-agency.ts
tsconfig.json
```

### جديدة وغير متتبعة: 24

```text
.agents/skills/supabase/CHANGELOG.md
.agents/skills/supabase/SKILL.md
.agents/skills/supabase/assets/feedback-issue-template.md
.agents/skills/supabase/references/skill-feedback.md
.vercelignore
QA_REMEDIATION_REPORT.md
android-twa/app-open-check-sm.jpg
android-twa/app-open-check.png
android-twa/home-after-icon.png
android-twa/home-icon-check-sm.jpg
android-twa/home-icon-check.png
android-twa/icon-preview-128.jpg
android-twa/icon-verify.png
docs/QA_COVERAGE_MATRIX.md
docs/QA_FULL_PRODUCTION_AUDIT.md
prisma/migrations/20261001000000_align_schema_with_code/migration.sql
scripts/ensure-agency-login.mjs
scripts/find-taha-user.mjs
scripts/generate-app-icons.mjs
scripts/inspect-prod-env.mjs
scripts/list-agencies.mjs
scripts/qa-ensure-personas.mjs
skills-lock.json
tools/_demo-login.json
```

### محذوفة

لا توجد ملفات محذوفة غير ملتزمة (`D=0`).

## تصنيف التغييرات

التصنيف أدناه مستنتج من المسارات والمحتوى الذي أمكن فحصه؛ لا توجد متطلبات قبول أو حالة قاعدة بيانات تكفي للجزم بأن كل تغيير ضروري.

- **تغييرات منتج مرشحة للحفظ بعد المراجعة:** تعديلات `app/`, `application/`, `components/`, `lib/`، ملفات تطبيق `apps/mobile/`، وأيقونات `public/icons/`. تتضمن مسارات العرض والمصادقة والمفضلة والإعلانات ولوحة الإدارة والموبايل. لا تخلطها تلقائيًا بتغييرات التوثيق أو أسرار QA.
- **تغييرات بنية/تكامل عالية المخاطر:** `prisma/schema.prisma`، مجلدا migrations المعدّلان وmigration الجديدة، `lib/db.ts`، `apps/mobile/app.json`، `.gitignore`، `.vercelignore`، و`tsconfig.json`. تتطلب مراجعة منفصلة قبل الالتزام أو النشر.
- **اختبار/QA وتوثيق:** `QA_REMEDIATION_REPORT.md`، `docs/QA_COVERAGE_MATRIX.md`، `docs/QA_FULL_PRODUCTION_AUDIT.md`، `scripts/qa-ensure-personas.mjs`، `scripts/find-taha-user.mjs`، `scripts/list-agencies.mjs`، `scripts/ensure-agency-login.mjs`، وملفات `.agents/` و`skills-lock.json`.
- **مخرجات/ملفات مؤقتة مرشحة للاستبعاد من commit المنتج:** صور الفحص السبع تحت `android-twa/` (أسماء `*-check*`, `home-after-icon.png`, `icon-preview-128.jpg`, `icon-verify.png`)، و`tools/_demo-login.json` إلى أن تتم مراجعة محتواه. أيقونات `apps/mobile/assets/` و`public/icons/` تبدو أصول تطبيق مقصودة وليست صور QA.
- **حساسة أو قادرة على تغيير بيانات:** ملفات `.env*` الموجودة محليًا مستثناة حاليًا بقواعد `.gitignore`؛ لم تُقرأ قيمها. `tools/_demo-login.json` يحتاج فحصًا محليًا قبل إضافته. `scripts/qa-ensure-personas.mjs` و`scripts/ensure-agency-login.mjs` يقرآن بيانات Supabase/Prisma من ملف production ويستطيعان إنشاء مستخدمين أو تغيير كلمات مرور/أدوار حسابات. `tools/create-approved-agency.ts` يحذف مستخدم demo سابقًا ثم ينشئه باستخدام مفاتيح Supabase admin. توجد كلمات مرور اختبار ثابتة داخل هذه scripts؛ لا تُرفع إلى GitHub قبل إزالة الأسرار/تدوير أي بيانات اعتماد مشتركة ومراجعة نطاق اتصالها. `scripts/find-taha-user.mjs` و`list-agencies.mjs` يطبعان بيانات مستخدمين من DB. لم تُشغّل هذه scripts.

## Prisma وSupabase وبيئة التشغيل

- تعديل migration سبق وجوده قد يسبب اختلاف checksum إذا كان قد طُبق سابقًا. لا يمكن معرفة حالة `_prisma_migrations` دون اتصال قاعدة البيانات، ولم يُجر هذا الاتصال.
- migration `20261001000000_align_schema_with_code` تنشئ enums وجداول `SavedSearch` و`PropertyRequest` و`PropertyRequestMessage` و`Report` وقيودًا وفهارس، وتحوّل enum الخاص بـ`Listing.contactMethod`. هذا ليس تغييرًا آمنًا للنشر لمجرد أن التطبيق يبني.
- migrations `20260929_project_archive_complex` و`20260929_project_kind` عُدّلتان لإضافة bootstrap وتعويض ترتيب/اعتماد migrations. يجب عدم تعديل migrations منشورة/مطبقة؛ إذا كانت مطبقة، يلزم migration تصحيحية جديدة بعد مراجعة DBA.
- `prisma/schema.prisma` يحذف حقل `User.loginPassword`. migration الجديدة تذكر استبعاده، لكنها لا تحذف العمود من DB؛ إن كان العمود يحتوي كلمات مرور قديمة فستبقى البيانات في قاعدة البيانات ما لم توجد خطة إزالة منفصلة وآمنة.
- migration الجديدة تبدّل نوع `ContactMethod` عبر إنشاء نوع مؤقت ثم إسقاط القديم؛ تتطلب مراجعة قيم البيانات والمراجع والفشل الجزئي قبل تشغيلها. لم يُنفّذ `prisma migrate` أو أي SQL.
- ملف `.env.vercel.production` موجود محليًا بحسب فحوص أسماء الملفات فقط، ولا يُعرض محتواه هنا. يجب تأكيد أنه ignored وألا يُضاف بـ`git add -f`. لا توجد قيمة `VERCEL_TOKEN` في البيئة. ملفات QA تتوقع `SUPABASE_SERVICE_ROLE_KEY` وبيانات اتصال DB، لذلك تشكل scripts خطرًا إذا عملت ضد الإنتاج.
- `.vercelignore` يستثني `apps/mobile/` و`android-twa/` وملفات env من رفع Next.js، لكنه لا يستثني `scripts/` و`tools/`؛ قد تُرفع scripts غير اللازمة مع مصدر النشر. راجع ذلك قبل نشر أي preview.
- سجل `QA_REMEDIATION_REPORT.md` يقول إن build سابقًا نجح، لكن هذا لا يثبت build للشجرة الحالية؛ كما يقول «لا تغيير schema» خلافًا لجرد Git الحالي. اعتبره ملاحظة سابقة لا تحققًا راهنًا. لم يُشغّل build أو lint أو typecheck في هذا التدقيق.

## Vercel والإنتاج

- `.vercel/project.json` يثبت project/org IDs فقط؛ لا يحتوي `productionBranch` أو deployed commit SHA.
- لم يتوفر `vercel` CLI أو `VERCEL_TOKEN`، لذلك لم يمكن قراءة إعدادات المشروع من Dashboard/API.
- الفرع الذي ينشر Vercel إلى Production **غير معروف** من الأدلة المحلية؛ لا تفترض أنه `main`.
- لا توجد طريقة متاحة هنا لمطابقة HTML المنشور مع commit محدد. المشاهدة السابقة لاسم التصنيف القديم تثبت فقط أن الإنتاج لا يحتوي تغيير التسمية المحلي الحالي. يلزم Deployment metadata من Vercel (commit SHA/branch) للمطابقة القطعية.

## خطة مزامنة آمنة بعد الموافقة

1. أنشئ فرع حماية محليًا من `mobile/foundation-phase-1` الحالية، لا من `main`، للحفاظ على commits التسعة وعلى الشجرة دون تغيير محتواها. لا تُنفّذ ذلك قبل موافقة المستخدم.
2. راجع التغييرات على دفعات موضوعية، ولا تستخدم `git add -A`. التزم بملفات المنتج والاختبارات/التوثيق التي وافق عليها صاحب المشروع فقط، مع commits منفصلة للموبايل/الويب/migrations عند الحاجة.
3. أبقِ `.env*` و`.vercel/` خارج Git؛ لا ترفع ملفات demo أو بيانات مستخدمين أو كلمات مرور ثابتة. انقل الحاجة إلى credentials آمنة خارج المستودع، ودوّر أي مفاتيح/كلمات مرور ثبت أنها حقيقية أو مكشوفة.
4. افحص إعدادات Vercel يدويًا قبل أي push: ثبّت production branch، وتأكد أن فرع الحماية ينشئ Preview فقط وأن Preview لا يستخدم مفاتيح أو DB إنتاجية. لا تغيّر إعدادات النشر الآن.
5. راجع migration history في بيئة غير إنتاجية، قارنها مع migrations الموجودة على GitHub ومع حالة DB، واختبر replay من قاعدة نظيفة ونسخة بيانات staging. لا تعدّل migrations مطبقة؛ أنشئ forward migration مصححة عند اللزوم. خذ backup قبل أي ترحيل معتمد.
6. شغّل `npm run lint`, `npm run typecheck`, و`npm run build` بعد عزل التغييرات، ثم smoke/regression tests. افحص `git diff --check` وأزل المسافة الزائدة.
7. بعد الموافقة فقط، ارفع الفرع المنفصل إلى GitHub وافتح PR إلى فرع الإنتاج المؤكد. لا تدمج ولا تنشر إلى Production قبل مراجعة PR ونجاح Preview والاختبارات وموافقة صريحة منفصلة.

## ما لم يُنفذ

لم تُنفّذ أوامر `git pull`, `git push`, `git fetch`, `git reset`, `git merge`، ولم تُحذف أو تُعدّل أي ملفات (عدا إنشاء هذا التقرير)، ولم يحدث اتصال أو تعديل لقاعدة بيانات، أو نشر Vercel، أو build/lint/typecheck. لا توجد عملية مزامنة أو نشر تنتظر الاكتمال.

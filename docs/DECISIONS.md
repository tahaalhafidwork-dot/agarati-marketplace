# Decisions

P0 locks for AGARATİ.COM. Do not reopen these in Sprint 0 implementation work.

## Auth — Supabase Auth

Authentication, sessions, and password reset use **Supabase Auth**. Sprint 0 ships UI stubs only (`/login`, `/register`, `/forgot-password`). No real session, JWT handling, or auth middleware.

## Data — Prisma + Postgres

Application data lives in **PostgreSQL** via **Prisma**. `prisma/schema.prisma` is a commented placeholder. No datasource URL, client generation, or queries in Sprint 0.

## Storage — Supabase Storage

Listing images use **Supabase Storage**. No upload, signed URL, or bucket wiring in Sprint 0.

## Contact — ContactLead + WhatsApp / Call

Inbound interest on a listing is a **ContactLead** (form → lister inbox), plus public **tel:** and **WhatsApp** deep links from the lister’s phone. Not an in-app chat thread.

## Favorites — MVP launch blocker

**Favorites are required to launch the MVP.** Persistence via Prisma `Favorite` model.

## Admin moderation

Listings are not public until **admin moderation** (approve / reject). Sprint 0 has admin screens only — no moderation logic.

## Agencies — public directory

Approved agencies (`accountType=AGENCY` / `agencyUpgradeStatus=APPROVED`) appear on **`/agencies`** with search by **region** (office city → district → neighborhood) or **project** (`Project` + `AgencyProject`). Agency public profile: `/agencies/[slug]`. Not a full CRM (no commissions, multi-user desks).

**Projects:** agencies may **propose** a residential or mixed-use project (not shopping malls) → `PENDING` until admin approves. Admins may **create / edit / cover / archive** projects on `/admin/projects`, and set one **official sales desk** (`AgencyProject.isOfficialSalesDesk`) per project. Public `/projects` lists `RESIDENTIAL` and `MIXED_USE` only (`APPROVED`). Soft-archive uses `ProjectStatus.ARCHIVED`.

**Listing complexes:** when a lister marks an ad as inside a complex, they must pick an **APPROVED** project (merged with static `locations.ts` complexes) or **propose a new name**. Proposals create a `PENDING` `Project` + listing stays `PENDING`. Exact/near-duplicate names in the same city are blocked (force select existing). On listing approve, admin may rename the complex or merge into an existing approved project — then the complex appears in public lists. Individuals propose only via the listing wizard; agencies may also propose standalone.

**Project gallery:** any signed-in user may **contribute a photo** on `/projects/[slug]` → `ProjectPhoto` stays `PENDING` until admin approves on `/admin/projects`. Published with contributor name + date. Cap: **30 approved** photos per project. Maps: when the project has city/district data, public page links to **OpenStreetMap** and **Google Maps** (approximate area — no exact pin).

## Daily rental — residential + farms

**إيجار يومي** is available for: شقق سكنية، منازل مستقلة، فلل وقصور، مزارع سياحية.
Offices, land, and buildings stay sale + long-term rent only.
Badge / filter labels: `للبيع` · `للإيجار` · `إيجار يومي`.

## Git — local Git

Source of truth is **local Git** (this repository). No alternate VCS.

## Android Play shell — TWA (Hybrid)

**Google Play v1** ships the production mobile web via **Trusted Web Activity (Bubblewrap)**. Expo (`apps/mobile`) stays in-repo **frozen** (no M2 expansion until native-only needs). Do not delete Expo or `/api/mobile/*`. Details: `docs/ANDROID_PLAY_PATH.md`.

## Explicitly not now

Full street-level GPS pins, ads, Meilisearch, and payments are deferred.
**Approximate area maps** (OpenStreetMap + neighborhood circle, no exact address) are allowed for browse/detail.

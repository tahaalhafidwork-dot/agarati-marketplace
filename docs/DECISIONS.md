# Decisions

P0 locks for AGARATİ.COM. Do not reopen these in Sprint 0 implementation work.

## Auth — Supabase Auth

Authentication, sessions, and password reset use **Supabase Auth**. Sprint 0 ships UI stubs only (`/login`, `/register`, `/forgot-password`). No real session, JWT handling, or auth middleware.

## Data — Prisma + Postgres

Application data lives in **PostgreSQL** via **Prisma**. `prisma/schema.prisma` is a commented placeholder. No datasource URL, client generation, or queries in Sprint 0.

## Storage — Supabase Storage

Listing images use **Supabase Storage**. No upload, signed URL, or bucket wiring in Sprint 0.

## Contact — ContactLead

Inbound interest on a listing is a **ContactLead**, not a chat thread. Sprint 0 has the dashboard route only. No persistence, email, or notifications.

## Favorites — MVP launch blocker

**Favorites are required to launch the MVP.** The dashboard route and header stubs exist. Persistence is out of Sprint 0 but must land before launch.

## Admin moderation

Listings are not public until **admin moderation** (approve / reject). Sprint 0 has admin screens only — no moderation logic.

## Agencies — placeholder only

`/agencies` is informational. An agency is an account role, not a CRM or public directory product in the MVP.

## Daily rental — deferred

Daily / short-stay rental is **out of scope**. MVP is sale and long-term rent.

## Git — local Git

Source of truth is **local Git** (this repository). No alternate VCS.

## Explicitly not now

Maps, in-app chat/messages, ads, Meilisearch, and payments are deferred.

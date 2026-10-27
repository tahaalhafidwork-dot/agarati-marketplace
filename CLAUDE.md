# AGARATİ — Claude / coding agents

@AGENTS.md

## Product

AGARATİ.COM is a focused Iraqi real-estate marketplace for listings, residential projects, and approved agencies. UI chrome is Arabic (`lang=ar`, `dir=rtl`). Mobile-first.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Lucide.

Locked for later (not in Sprint 0): Supabase Auth, Prisma + Postgres, Supabase Storage.

## Sprint 0 — do not implement

- Real authentication or session cookies
- Database connection, Prisma Client, or migrations
- Image upload / storage buckets
- Persisting contact leads or favorites
- Admin approve/reject workflows
- Maps, chat, ads, Meilisearch, payments

## Sprint 0 — do implement

- Public shell (header/footer, RTL)
- Placeholder routes under `(public)`, `(auth)`, `dashboard`, `admin`
- Docs in `docs/`
- `lint`, `typecheck`, `build` passing

Favorites are an MVP **launch blocker** (persist later). Reports are deferred. Agencies stay informational.

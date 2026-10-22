<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGARATİ agents

Marketplace MVP: Arabic RTL, mobile-first, Next.js App Router.

Native app work lives in `apps/mobile` (Expo). See `docs/MOBILE_ARCHITECTURE.md`. Web business logic stays protected — mobile uses thin `/api/mobile/*` adapters + Supabase Auth on device.

## Read first

- `docs/DECISIONS.md` — P0 locks
- `docs/UI_SYSTEM.md` — chrome and listing rules
- `docs/PRD.md` — in / out of MVP
- `docs/MCP_UI.md` — shadcn + 21st MCP for pulling UI templates

## MVP boundaries

**In:** public browse, listing cards (4/3; street on detail only), auth screens, lister dashboard, ContactLead inbox UI, favorites UI, admin review screens, **approved agency directory** (`/agencies` by region/project).

**Out of Sprint 0 (forbidden here):**

- Real Supabase Auth or session
- Database connection or Prisma queries
- Supabase Storage uploads
- ContactLead or favorites persistence
- Admin approve/reject logic
- Maps, chat/messages, ads, Meilisearch, payments
- Daily rental (except شقق / منازل / فلل / مزارع)
- Agency CRM (commissions / multi-desk) — directory search is allowed

## Conventions

- Keep `lang=ar` `dir=rtl` on the root document
- Primary `#0F2744` (deep ink navy), gold accent `#B8956C`, muted foreground `#6B6560`
- Mobile is the visual source of truth — desktop polish only via `md:` / `lg:` (see `docs/UI_SYSTEM.md` Desktop enhancement contract)
- No public messages/chat links in the header
- URL filters and page size 24 when search is implemented
- Prefer small placeholders over fake backends

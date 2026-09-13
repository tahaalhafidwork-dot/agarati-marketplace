<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGARATİ agents

Marketplace MVP: Arabic RTL, mobile-first, Next.js App Router.

## Read first

- `docs/DECISIONS.md` — P0 locks
- `docs/UI_SYSTEM.md` — chrome and listing rules
- `docs/PRD.md` — in / out of MVP

## MVP boundaries

**In:** public browse, listing cards (4/3, no exact address), auth screens, lister dashboard, ContactLead inbox UI, favorites UI, admin review screens.

**Out of Sprint 0 (forbidden here):**

- Real Supabase Auth or session
- Database connection or Prisma queries
- Supabase Storage uploads
- ContactLead or favorites persistence
- Admin approve/reject logic
- Maps, chat/messages, ads, Meilisearch, payments
- Daily rental
- Agency CRM or directory

## Conventions

- Keep `lang=ar` `dir=rtl` on the root document
- Primary `#0F766E`, muted foreground `#57534E`
- No public messages/chat links in the header
- URL filters and page size 24 when search is implemented
- Prefer small placeholders over fake backends

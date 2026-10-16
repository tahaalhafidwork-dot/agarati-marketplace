# Mobile API — thin adapter policy

## Principle

Route Handlers under `app/api/mobile/**` are **transport adapters**. They must call existing read/query helpers (e.g. `fetchPublicListings`, `fetchListingById`) and later shared command modules — not re-implement pricing, moderation, quota, or complex-merge rules.

## Phase 1 shipped

- `GET /api/mobile/health` — JSON status for the Expo foundation to hit a real backend path.

## M1 shipped (thin adapters)

- `GET /api/mobile/v1/listings` — browse; query parity with `/properties` (`type`, `deal`, `city`, `q`, `sort`, …); delegates to `fetchPublicListings`.
- `GET /api/mobile/v1/listings/:id` — detail DTO; delegates to `fetchListingById`.

## Auth model (M1+)

1. App signs in with Supabase Auth (email/password or future providers).
2. App sends `Authorization: Bearer <access_token>` to protected mobile routes.
3. Handler resolves user → Prisma `User.id` (same UUID as today).
4. Never ship `SUPABASE_SERVICE_ROLE_KEY` in the app binary.

## Non-goals

- Exposing admin actions to the store apps.
- Replacing Server Actions used by the website.
- Changing Prisma schema for mobile convenience.

# Mobile audit — AGARATİ (Phase 1)

Audit date: 2026-03-30  
Source of truth UI: web at ~390px width (`docs/UI_SYSTEM.md` Desktop contract does **not** apply to the app).  
Web tree is **protected**: no business-logic changes for this phase.

## Product snapshot

Arabic RTL real-estate marketplace. Same users, listings, favorites, messages, ContactLeads, projects, agencies as the web app. Listing public id = Prisma `Listing.id` (cuid); human search key = `listingNumber`.

## Stack found (web)

| Layer | Reality |
| --- | --- |
| UI | Next.js App Router, Tailwind, shadcn, Lucide |
| Auth | Supabase Auth via `@supabase/ssr` **cookies** (`lib/auth.ts`, `middleware.ts`) |
| Data | Prisma → PostgreSQL |
| Media | Supabase Storage (`listing-images`) |
| Mutations | `"use server"` Server Actions under `lib/actions/**` |
| HTTP API | **None** — zero `app/api` routes |
| Maps | Leaflet / OSM approximate area only |

## Domain entry points (do not call Server Actions from native)

| Domain | Mechanism today | Mobile need |
| --- | --- | --- |
| Auth | FormData Server Actions + cookie session | Supabase JS Auth (session tokens) on device |
| Browse / detail | RSC → `lib/listing-service.ts` | Read JSON API (or shared query module behind Route Handlers) |
| Favorites | `toggleFavoriteAction` / guest sync | Authenticated JSON endpoints |
| ContactLead | `submitContactLeadAction` (public) | JSON submit + rate limit later |
| Messages | Server Actions + Realtime channel | Token auth + tighter ACL + Realtime |
| Listing wizard | FormData create/update actions | Multipart/JSON create later (M2+) |
| Locations | `lib/locations.ts` static cascade | Ship as shared JSON or duplicate catalog in app package |

## Mobile chrome locks (~390px)

- Bottom nav 5 items: Agarly · مشاريع · **أضف إعلاناً** (raised FAB) · خدمات · حسابي
- Dual header: `SiteHeader` vs `AppSubHeader` on `/properties*` and `/categories*`
- Detail contact bar fixed above bottom nav
- Tokens: `#0F2744` · `#B8956C` · `#6B6560` · canvas `#F6F3EE` · surface `#FFFCF8`
- Cards/gallery **4:3**; list rows ~88px thumb on browse

## Risks / unclear points

1. **No mobile-ready API** — Server Actions are Next-specific + cookie-bound.
2. **Message ACL** — `getMessagesAction` may be too open for any signed-in user when contactMethod allows chat; must harden before M1 messaging.
3. **Plaintext `loginPassword` on User** — admin convenience; never expose to mobile clients.
4. **Unauthenticated ContactLead / view counters** — need rate limits when opened to apps.
5. **Local Android SDK missing** on this machine (no `JAVA_HOME` / `ANDROID_HOME`) — Expo project can still typecheck and start Metro; native `run:android` needs SDK install.
6. Nested tool repo `tools/design-md-extractor` ignored — irrelevant to mobile.

## Reuse vs build

| Reuse as-is (logic/data) | Build for mobile |
| --- | --- |
| Postgres schema + IDs | Expo Router app shell |
| Supabase Auth users / Storage buckets | Thin Route Handlers JSON facade |
| `lib/locations.ts` catalog (export/copy) | RN screens (M1+) matching 390px |
| Listing DTO shapes from `toPublicListingCard` | Design tokens module in app |
| Product rules in `docs/DECISIONS.md` | Native deep links later |

## Phase 1 outcome target

Documented architecture + Expo foundation that boots + optional `/api/mobile/health` — **no product screens**.

## Phase 1 verification (this machine)

| Check | Result |
| --- | --- |
| `apps/mobile` `tsc --noEmit` | pass |
| `expo export --platform android` | pass → `dist/` Hermes bundle |
| `GET /api/mobile/health` against local Next | pass (`ok: true`) |
| Web `GET /` | pass (200) |
| OpenJDK 17 | installed via winget |
| Android SDK / `ANDROID_HOME` / emulator | **missing** — blocks `expo run:android` until SDK install |

# Mobile architecture — AGARATİ

## Current Play decision (2026-09-30)

**Play v1 shell = Trusted Web Activity (TWA)** wrapping the production HTTPS mobile site.
**Expo (`apps/mobile`) is frozen** — keep as R&D; do not delete; do not expand M2 until product requires native-only features.

See [`ANDROID_PLAY_PATH.md`](./ANDROID_PLAY_PATH.md), [`PWA.md`](./PWA.md), [`ANDROID_TWA.md`](./ANDROID_TWA.md).

---

## Prior Phase 1 note (historical)

Phase 1 chose Expo + React Native for a native client and advised against shipping a plain WebView as the product. That choice remains valid for a **native** track. It does **not** block TWA (Chrome Custom Tabs / full Chrome engine with Digital Asset Links), which is the supported Play packaging path for a PWA origin.

## Why Expo remains in-repo

| Criterion | Assessment |
| --- | --- |
| Team / stack adjacency | TypeScript + React; closest to current web |
| Auth | Official `@supabase/supabase-js` session storage on device |
| Navigation | Expo Router file routes mirror web IA (`(tabs)`, auth groups) |
| OTA / stores | EAS Build when Android SDK/credentials ready |
| Future native needs | FCM UX, offline drafts, iOS App Store native strategy |

## System shape (Expo track — frozen)

```text
┌─────────────────────┐     HTTPS JSON      ┌──────────────────────────┐
│  Expo app           │ ──────────────────► │  Next.js Route Handlers  │
│  apps/mobile        │   Bearer / cookies  │  app/api/mobile/*        │
│  Supabase Auth SDK  │ ◄────────────────── │  thin adapters only      │
└─────────┬───────────┘                     └────────────┬─────────────┘
          │ session                                        │ calls
          ▼                                                ▼
┌─────────────────────┐                     ┌──────────────────────────┐
│  Supabase Auth      │                     │  Existing domain modules │
│  + Storage          │                     │  listing-service, Prisma │
└─────────────────────┘                     │  NO duplicated rules     │
                                            └──────────────────────────┘
```

## System shape (TWA / Play track — active)

```text
┌─────────────────────┐   HTTPS (same origin)  ┌──────────────────────────┐
│  TWA (Bubblewrap)   │ ─────────────────────► │  Next.js mobile web     │
│  com.agarati.app    │   Chrome + cookies     │  Server Actions + UI    │
│  Digital Asset Links│ ◄───────────────────── │  Manifest + SW + PWA    │
└─────────────────────┘                        └──────────────────────────┘
```

## Rules (hard)

1. Web business logic stays in existing modules; Route Handlers **adapt** only.
2. Same Supabase project, same Postgres, same Storage, same listing/user IDs.
3. Mobile visual SoT = web at ~390px — not desktop `lg:` layouts.
4. No mock backend for demos that hide integration failures.
5. Admin surfaces stay web-first unless explicitly scoped later.
6. Do **not** delete `apps/mobile` or `/api/mobile/*` while TWA is the Play shell.

## Minimal API layer (Expo M1 — keep)

| Endpoint | Purpose | Phase |
| --- | --- | --- |
| `GET /api/mobile/health` | Liveness + env flags (no secrets) | Done |
| `GET /api/mobile/v1/listings` | Browse | Done |
| `GET /api/mobile/v1/listings/:id` | Detail DTO | Done |
| `POST /api/mobile/v1/favorites/:listingId/toggle` | Auth required | Done |
| Auth | Device ↔ Supabase directly (not via Next) | Done |

## App package layout (Expo — frozen)

```text
apps/mobile/
  app/                 Expo Router
  src/theme/           AGARATİ tokens
  src/lib/api.ts       typed mobile JSON client
  src/lib/types.ts     MobileListingCard / query DTOs
  src/lib/supabase.ts  device Supabase client (AsyncStorage session)
  src/data/access.ts   Home/Browse/Property/Favorites data-access facade
  app.json / eas.json / package.json
```

## Android / iOS delivery

- **Play (active):** PWA prerequisites + Bubblewrap TWA → signed AAB → Play Console (see `docs/ANDROID_TWA.md`).
- **Expo Dev (historical Phase 2):** Development Build via `expo prebuild` + `gradlew` / `expo run:android --device`.
- **Expo Release (paused):** EAS Build profiles remain in `apps/mobile/eas.json`.

## Out of scope on frozen Expo track

Listing wizard, messaging UI, agencies/projects screens, push notifications, EAS store submit (until native track resumes).

# AGARATI Android Play path — track decision

**Decision (2026-09-30):** **Hybrid — Track A (TWA) for Play**, Expo frozen (not deleted).

| Track | Status |
| --- | --- |
| **A — PWA + TWA (Bubblewrap) → Play** | **Active** — ship production mobile web as the Play shell |
| **B — Continue Expo M2** | **Paused** — no new Expo feature work until TWA gaps force native |
| **Expo `apps/mobile` + `/api/mobile/*`** | **Frozen archive / R&D** — keep; do not delete |

## Why

- Mobile-first Next.js UI is already the product; Expo was rebuilding it for packaging.
- TWA reuses UI + Supabase + Prisma + Storage with no React Native rewrite for Play v1.
- Expo remains for later native push / offline drafts / iOS-native store strategy if needed.

## Package id

Play / TWA product package: **`com.agarati.app`** (same id as Expo Dev Build). Expo stays local-only while TWA owns Play listing.

## Production URL

Set `NEXT_PUBLIC_SITE_URL` to the **HTTPS** production origin (no localhost). TWA and Digital Asset Links bind to that origin.

See also: [`ANDROID_TWA.md`](./ANDROID_TWA.md), [`PWA.md`](./PWA.md).

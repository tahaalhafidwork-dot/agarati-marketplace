# AGARATI Progressive Web App

Installability prerequisites for Chrome and Trusted Web Activity (TWA).

## What ships in-repo

| Piece | Location |
| --- | --- |
| Web App Manifest | `app/manifest.ts` → `/manifest.webmanifest` |
| Icons 192 / 512 | `public/icons/icon-192.png`, `public/icons/icon-512.png` |
| Service Worker | `public/sw.js` (shell cache + offline fallback) |
| SW registration | `components/pwa/register-sw.tsx` (production only) |
| Digital Asset Links | `app/.well-known/assetlinks.json/route.ts` |

## Env

```bash
NEXT_PUBLIC_SITE_URL=https://your-production-host.example
# Optional — required for TWA verification on device:
TWA_PACKAGE_NAME=com.agarati.app
TWA_SHA256_CERT_FINGERPRINTS=AA:BB:...  # Play App Signing + upload key; colon-hex
```

## Behaviour

- Manifest: `display: standalone`, Arabic name, theme `#0F2744`.
- SW precaches only `/offline` + icons. Navigations are **network-only** (offline shell on failure). Does **not** cache HTML pages, `/api/*`, dashboard, or auth routes — avoids stale listings and personal data in Cache Storage.
- SW registers only when `NODE_ENV === "production"` (avoids stale caches in `next dev`).

## Bubblewrap version fields

In `twa-manifest.json`, use **`appVersion`** (maps to Android `versionName`) and **`appVersionCode`**. Do not use `appVersionName` as the JSON key — Bubblewrap ignores it and leaves `versionName` empty.

## Verify installability

1. Deploy HTTPS origin with the files above.
2. Chrome → Application → Manifest + Service Workers.
3. Lighthouse PWA checks (installable).
4. After Bubblewrap signing keys exist, fill `TWA_SHA256_CERT_FINGERPRINTS` and confirm Asset Links.

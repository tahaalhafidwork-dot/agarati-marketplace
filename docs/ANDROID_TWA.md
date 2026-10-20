# AGARATI Trusted Web Activity (Bubblewrap → Play)

Play packaging for the production HTTPS mobile site. Does **not** replace or delete Expo.

## Prerequisites

1. Production origin with HTTPS (`NEXT_PUBLIC_SITE_URL`)
2. PWA pieces live (`docs/PWA.md`): manifest, icons, service worker
3. JDK 17+, Android SDK (Bubblewrap will prompt / use `ANDROID_HOME`)
4. Node 20+

## Package

- Application id: `com.agarati.app`
- Project folder: `android-twa/`

## One-time init

Set the live site URL (must already serve `/manifest.webmanifest` and `/sw.js`):

```powershell
cd android-twa
npm install
# Non-interactive project generation (local icons; host from env):
$env:TWA_HOST_URL = "https://YOUR_PRODUCTION_HOST"
npm run twa:generate
npm run twa:build
```

Output:

- `android-twa/app-release-bundle.aab` — upload to Play **Internal testing**
- `android-twa/app-release-signed.apk` — sideload smoke test

See [`PLAY_INTERNAL_TESTING.md`](./PLAY_INTERNAL_TESTING.md) for the Console checklist.

Alternative (interactive Bubblewrap against a live manifest):

```powershell
$env:TWA_HOST_URL = "https://YOUR_PRODUCTION_HOST"
npm run twa:init
```

## Signing & Asset Links

1. Create / reuse an upload keystore (Bubblewrap can generate one on init).
2. After first Play upload, copy **App signing key certificate** SHA-256 from Play Console → App integrity.
3. Set on the **web** deploy:

```bash
TWA_PACKAGE_NAME=com.agarati.app
TWA_SHA256_CERT_FINGERPRINTS=<Play signing>,<upload key>
```

4. Confirm `https://YOUR_HOST/.well-known/assetlinks.json` returns the relation JSON (not `[]`).
5. On device, TWA must open **without** the URL bar (broken asset links → Chrome Custom Tabs fallback).

## Play Console — internal testing checklist

- [ ] Developer account
- [ ] Create app `أغاراتي` / `AGARATI`
- [ ] Upload signed AAB to **Internal testing**
- [ ] Store listing (AR short + full description, screenshots from mobile web ~390px or device)
- [ ] Privacy Policy URL
- [ ] Data safety form
- [ ] Content rating questionnaire
- [ ] Target API / Play App Signing enabled
- [ ] Asset Links verified
- [ ] Smoke: login, favorite, listing create/upload, maps, messages inside TWA

## Local validation without Play

```powershell
npm run twa:build
# Install the APK/AAB on a device or emulator via bundletool / Play internal track
```

## Expo freeze

`apps/mobile` stays frozen. Do not expand M2 while this track owns Play. See `docs/ANDROID_PLAY_PATH.md`.

## Windows SDK / JDK quirks

Bubblewrap’s path checks are older than current Android cmdline-tools layouts:

1. Ensure `ANDROID_HOME/tools` exists (empty dir is enough for validation).
2. Junction `ANDROID_HOME/bin` → `cmdline-tools/latest/bin` if `sdkmanager.bat` is missing at `bin/`.
3. Install `build-tools;36.1.0` (version Bubblewrap pins).
4. Point `~/.bubblewrap/config.json` `jdkPath` at a **space-free** path (e.g. `C:\jdk17` junction to Microsoft JDK 17).

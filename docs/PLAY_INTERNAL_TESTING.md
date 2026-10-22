# Play Console — AGARATI TWA internal testing

Signed bundle produced locally: `android-twa/app-release-bundle.aab` (gitignored; rebuild with `npm run twa:build`).

## Before upload

1. Deploy the Next.js site to a **stable HTTPS** origin (not a temporary tunnel). Set:

```bash
NEXT_PUBLIC_SITE_URL=https://YOUR_PRODUCTION_HOST
TWA_PACKAGE_NAME=com.agarati.app
TWA_SHA256_CERT_FINGERPRINTS=<upload-key-sha256>[,<play-app-signing-sha256>]
```

2. Regenerate TWA against that host (required — do not upload an AAB pointed at `*.trycloudflare.com`):

```powershell
cd android-twa
$env:TWA_HOST_URL = "https://YOUR_PRODUCTION_HOST"
npm run twa:generate
npm run twa:build
```

3. Confirm Asset Links:

```text
https://YOUR_PRODUCTION_HOST/.well-known/assetlinks.json
```

Must return a non-empty JSON array (not `[]`).

Local **upload key** SHA-256 (dev keystore on this machine — also add Play App Signing cert after first Console upload):

```text
87:C5:D5:6C:1A:5F:C2:8E:B2:B7:8A:3C:B7:5C:AE:C6:4B:66:5A:48:3A:A9:BF:74:CC:B5:57:DA:C2:A6:C9:EC
```

Re-print: `npm run twa:fingerprint` (needs keystore password from `.env.twa.local`).

## Internal testing track

1. [Play Console](https://play.google.com/console) → Create app → أغاراتي / AGARATI.
2. **Testing → Internal testing → Create new release** → upload `app-release-bundle.aab`.
3. Add testers (email list or Google Group).
4. Complete required forms before open/closed testing / production:
   - Store listing (AR title, short + full description, ~390px screenshots)
   - Privacy Policy URL
   - Data safety
   - Content rating
   - Target API / Play App Signing
5. On a tester device: install from the internal testing link; confirm **no Chrome URL bar** (Asset Links OK).
6. Smoke: login, favorite, create listing + upload, maps, messages.

## Windows Bubblewrap notes

- Bubblewrap expects `ANDROID_HOME/tools` or `bin`. Create `tools` dir and/or junction `bin` → `cmdline-tools/latest/bin` if missing.
- JDK path must not contain spaces (Bubblewrap passes java path unquoted). Use a junction, e.g. `C:\jdk17` → Microsoft JDK 17, and set `~/.bubblewrap/config.json` `jdkPath` accordingly.
- Passwords: `android-twa/.env.twa.local` → `BUBBLEWRAP_KEYSTORE_PASSWORD` / `BUBBLEWRAP_KEY_PASSWORD`.

# AGARATI TWA (Trusted Web Activity)

Bubblewrap project for Google Play. See [`docs/ANDROID_TWA.md`](../docs/ANDROID_TWA.md) and [`docs/PLAY_INTERNAL_TESTING.md`](../docs/PLAY_INTERNAL_TESTING.md).

```powershell
npm install
$env:TWA_HOST_URL = "https://YOUR_PRODUCTION_HOST"   # optional for first local AAB
npm run twa:generate
npm run twa:build
```

Artifacts (gitignored): `app-release-bundle.aab`, `app-release-signed.apk`, `android.keystore`.

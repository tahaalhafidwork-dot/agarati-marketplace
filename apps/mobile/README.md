# AGARATİ mobile (Expo)

Development build foundation — **no product screens yet**.

## Stack

Expo SDK 57 + React Native + Expo Router + **expo-dev-client** · same Supabase project as web · thin JSON via `GET /api/mobile/health` · M1 typed client in `src/lib` + `src/data`.

## Setup

```bash
cd apps/mobile
cp .env.example .env
# EXPO_PUBLIC_API_BASE_URL must be your PC LAN IP for a physical device
# e.g. http://192.168.1.71:3000
npm install
```

## Android development build (real device)

Requires JDK 17+, Android SDK (`ANDROID_HOME`), and USB debugging authorized (`adb devices`).

```bash
# From apps/mobile — generates android/ then builds + installs debug APK
npx expo prebuild --platform android
npx expo run:android --device

# Or build APK only, then install:
cd android && .\\gradlew.bat assembleDebug
adb install -r app\\build\\outputs\\apk\\debug\\app-debug.apk
```

Then start Metro for the development client:

```bash
npx expo start --dev-client
```

## Verify

```bash
npm run typecheck
```

## Docs

- `docs/MOBILE_AUDIT.md`
- `docs/MOBILE_ARCHITECTURE.md`
- `docs/MOBILE_API.md`

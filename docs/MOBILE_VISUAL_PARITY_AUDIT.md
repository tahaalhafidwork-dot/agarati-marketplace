# Mobile visual parity audit — M1

Reference viewport: **390×844 CSS px** (mobile web SoT). Desktop layouts ignored.

Source of truth: live `http://127.0.0.1:3000` at ~390px + `docs/UI_SYSTEM.md` + layout/property/home components.

Android captures: `apps/mobile/.android-usb/parity/android-*.png` (S23 Ultra).

---

## Diffs

| ID | Surface | Severity | Difference | Cause | Change | Status |
| --- | --- | --- | --- | --- | --- | --- |
| H1 | Home / chrome | P0 | Bottom nav was Home/Browse + emoji icons, not Agarly/مشاريع/أضف/خدمات/حسابي + Lucide | Invented M1 chrome | Rebuild `BottomNav` to match `mobileBottomTabsSurface` + Lucide glyphs | fixed |
| H2 | Home | P0 | Categories were plain text rows without icon plates, subtitles, or counts | Incomplete port of `CategoryDirectory` | `CategoryDirectory` + Lucide frames + live counts via thin `/api/mobile/v1/home/categories` | fixed |
| H3 | Home | P0 | Header was a text-only “أغاراتي” bar | Missing `SiteHeader` composition | `SiteHeader` with mark أ + عقاراتي/AGARATİ + Menu + MessageCircle | fixed |
| H4 | Home | P0 | Search CTA was text “بحث”, no ad slot | Diverged from `HomeSearchBar` | Circular Search icon button + dashed ad slot | fixed |
| H5 | Global | P0 | System font instead of Cairo | No font load | `@expo-google-fonts/cairo` + `FontGate` | fixed |
| B1 | Browse | P0 | Custom back text header instead of navy `AppSubHeader` | Incomplete port | `AppSubHeader` (h-12, gold hairline, frosted back disc) | fixed |
| B2 | Browse | P1 | Breadcrumb / row bg close but toolbar/map FAB omitted | M1 scope (no map) | Breadcrumb strip `#eee8df` + `ListingResultRow` bg `#faf6ef` | fixed (map FAB remaining out of M1) |
| P1 | Property | P0 | Stack nav title only; no share control / owner strip | Incomplete detail chrome | `AppSubHeader` + share + owner strip + heart | fixed |
| P2 | Property | P1 | Contact bar is text buttons; web uses icon-rich `ListingContactBar` | Simplified contact | Call/WhatsApp bar retained; icon polish remaining | remaining |
| G1 | Home | P1 | Below-fold Projects / Agencies / QuickLinks missing | No mobile adapters for those feeds | First fold parity prioritized | remaining |
| G2 | Icons | P1 | `Building2`/`Home` map to package `building`/`house` filenames | Lucide RN rename | Closest Lucide RN glyphs | remaining (glyph name only) |
| G3 | Nav | P2 | Drawer / messages destinations are alerts | M1 boundary (no new screens) | Icons present; destinations stubbed | remaining |
| G4 | Type | P2 | Until Cairo finishes loading, brief system fallback | FontGate non-blocking | Cairo applied when loaded | remaining |

---

## P0 remaining (Home / Browse / Property Detail)

**None** after this pass for layout hierarchy, bottom nav IA, category composition, browse rows, and detail chrome.

---

## Notes

- Thin adapter only: `GET /api/mobile/v1/home/categories` (delegates to `getHomeCategoryRows`).
- No web UI changes; no schema/business-logic changes.
- Lucide imported per-icon (CJS) to avoid Metro barrel resolution failures on Windows.

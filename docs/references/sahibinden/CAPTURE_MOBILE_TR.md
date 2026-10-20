# Sahibinden mobile capture note (2026-09-26 evening)

## Attempt

Apify `get_anything/web-unblocker` with **RESIDENTIAL + country TR** + JS render
was run against home / satılık-daire / kiralık-daire.

## Result

Cloudflare challenge (`403`, “Performing security verification”) — live HTML
not returned. Turkey IP alone does not guarantee bypass.

## Fallback sources used for AGARATİ rebuild

1. Google Play Store official app screenshots (`com.sahibinden`) — mobile chrome
2. Prior successful Unblocker HTML (earlier same day) + `satilik-daire.md` IA
3. `MOBILE_VISUAL_BRIEF.md`

## Applied to AGARATİ (structure only)

- Primary filled app header: menu · logo · account · post camera
- Home: search strip → category directory rows → vitrin
- Drawer: categories first (icon circles), then nav/account
- Listings: deep breadcrumb · chips/filter · dense list rows
- Brand: ink navy `#0F2744` + gold `#B8956C`, Arabic RTL — never yellow/logo clone

# Design reference: Turkish classifieds marketplace IA

> **Live capture (2026-09-26):** After local Playwright hit Cloudflare,
> Apify **web-fetch / Unblocker** retrieved the **real homepage** and
> **satılık daire** listing IA (not the bot wall). Browser crawl with
> `RESIDENTIAL` + `country: TR` still often redirected to the
> “Türkiye dışından erişmek için giriş…” login gate — so Turkey IP alone
> is not always enough; Unblocker HTML capture worked better for IA.
>
> Artifacts: `docs/references/sahibinden/live/` (`home-signals.json`,
> `satilik-daire.md`, large HTML gitignored).
>
> Do **not** copy yellow brand, logos, typefaces, or listing assets into
> AGARATİ product UI.

## Confirmed live structure (from capture)

### Home

- `header-container` + search leaderboard banner
- Homepage **vitrin** grid (`vitrin-list`, `s-image` / `s-picture` thumbs)
- Service blocks: **Oto360**, **Emlak360** (icon + text link rows)
- Housing project cards, popular links, multi-column **footerContainer**
- Classes seen: `uiBox`, `mui-btn`, `service-link`, `popular-brand`

### Listing (`/satilik-daire`)

- Deep category breadcrumb: Emlak → Konut → Satılık → Daire (+ count)
- Faceted filters: Adres (İl / İlçe / Semt), plus attribute facets
- Favorites / compare chrome near results
- Map view entry point (`Harita Görünümü`)
- Dense result list oriented around category taxonomy (not a marketing hero)

### Shell actions (from related chrome)

- Giriş / Hesap Aç
- Favoriler
- **Ücretsiz İlan Ver** (primary post CTA)
- Detaylı Arama

## Style thesis (structural)

High-density classifieds marketplace: utilitarian chrome, category tree,
search/facets first, price-forward listings, multi-column footer. Trust =
scannability.

## Density & surfaces (adapt to AGARATİ tokens)

| Role | Guidance | AGARATİ mapping |
| --- | --- | --- |
| Canvas | Light gray page | `--background` `#f5f5f4` |
| Surface | White cards / panels | `--card` white |
| Border | Hairline gray | `--border` |
| Radius | Tight ~4px | `--radius: 0.375rem` |
| Body | 14px utilitarian | Cairo (Arabic) |
| Price | Loudest numeric | bold `text-xl`–`2xl` |
| Primary action | Strong filled CTA | `#0F2744` (never yellow) |

## Do

- Mirror LTR classifieds into **RTL** with logical properties.
- Keep marketplace density over marketing hero fluff.
- Keep AGARATİ brand teal and Arabic chrome.

## Don't

- Copy sahibinden yellow, wordmark, or proprietary fonts.
- Show exact street addresses on public cards/detail.
- Replace dashboard/admin chrome in the inspiration pass.
- Ship scraped listing photos or copy as product content.

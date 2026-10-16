# Adaptation: marketplace density → AGARATİ

Maps [DESIGN.md](./DESIGN.md) into this repo without cloning sahibinden brand.

Live IA evidence (2026-09-26) is in [live/](./live/) — Unblocker HTML/Markdown of home + satılık daire.

| Pattern | AGARATİ implementation |
| --- | --- |
| Dense sticky header | `components/layout/site-header.tsx` — solid bar, post CTA, wider container |
| Multi-column footer | `components/layout/site-footer.tsx` |
| Search-first home | `app/(public)/page.tsx` + enhanced search panel |
| Filter rail + results | `app/(public)/properties/page.tsx` |
| Price-forward card | `components/property/property-card-placeholder.tsx` |
| Detail gallery + sticky aside | `app/(public)/properties/[slug]/page.tsx` |
| Gray canvas / tight radius | `app/globals.css` + `docs/UI_SYSTEM.md` |
| Auth consistency | `(auth)/layout.tsx` on marketplace canvas |

## Locked brand (unchanged)

- Primary `#0F2744`, gold `#B8956C`, muted foreground `#6B6560`
- `lang=ar` `dir=rtl`
- Card aspect **4 / 3**
- Page size **24**
- No public chat links in header

## Later “لمسات”

Leave room for AGARATİ-specific polish (illustration, motion, brand mark
refinement) without changing the marketplace IA established here.

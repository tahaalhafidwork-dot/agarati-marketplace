# UI system

Tokens and layout rules for AGARATİ public chrome.

Marketplace density draws on established classifieds information architecture
([docs/references/sahibinden/DESIGN.md](references/sahibinden/DESIGN.md)) as a historical
structure reference only. Brand colors and market positioning stay Iraqi and distinctly AGARATİ.

## Language and direction

- Public chrome is **Arabic**
- Root document: `lang="ar"` `dir="rtl"`
- Mobile-first; desktop is an enhancement
- Prefer logical properties (`ps`/`pe`, `ms`/`me`, `start`/`end`)

## Desktop enhancement contract

- **Mobile is the visual source of truth.** Do not change unprefixed (mobile) layout, spacing, or behavior to “fix” desktop.
- Every desktop polish must be behind `md:` and/or `lg:` only (prefer `lg:` for structural columns).
- Do not reorder DOM in a way that alters mobile flow; hide/show aside columns with `hidden lg:block` instead of restructuring mobile trees.
- Public shell: `max-w-7xl`. App shells (dashboard/admin): base `max-w-6xl`, widen with `lg:max-w-7xl`.
- Acceptance: phone viewport looks unchanged; wide screens gain columns, denser rows, sticky asides, and side nav.

## Color

| Token | Value | Use |
| --- | --- | --- |
| Primary | `#0F2744` | Headers, actions, brand (deep ink navy) |
| Gold accent | `#B8956C` | Prices, luxury highlight |
| Muted foreground | `#6B6560` | Secondary text |
| Canvas | `#F6F3EE` | Warm ivory page background |
| Surface | `#FFFCF8` | Cards, panels |

Keep contrast readable. Do not introduce a second brand hue (no yellow clone).

## Density

- Tighter radius: `--radius: 0.375rem`
- Utilitarian type scale; price is the loudest number on cards/detail
- Wider content shell: `max-w-7xl`

## Property card

- Image frame aspect ratio **4 / 3**
- Show: price, title, district/neighborhood only, short meta, favorite stub
- Cards stay at city · neighborhood [/ complex] — street belongs on **detail**

## Search and listing

- Filters live in the **URL** (query params), not only in component state
- Location cascade: مدينة → قضاء → حي → مجمع سكني (`lib/locations.ts`)
- Cards: city · neighborhood [/ complex]; detail may include المحلة/الشارع
- Default page size: **24**
- Desktop (`lg+`): filter rail on **inline-start** + richer result rows
- Home leads with a search panel, not a marketing hero essay

## Detail

- Breadcrumb → gallery → attribute table
- Aside (`lg+`): price + sticky contact / favorite CTAs; mobile keeps bottom contact bar

## Favorites

Favorites are **P0**. Heart / save affordances may be stubbed in Sprint 0 but the product cannot launch without them.

## Shell

- Sticky header: solid surface + category quick-links strip (`lg+`), search field (`lg+`), post listing CTA, favorites
- Footer: multi-column link groups + copyright bar (`md+`; mobile uses bottom nav)
- Home: category directory multi-column (`lg+`) + search panel + dense vitrin grid
- Listings: deep filter rail + denser list rows on desktop; same row component on mobile (smaller thumb)
- Detail: gallery + tabs main column; sticky contact aside on desktop; mobile bottom bar
- App shells: horizontal tab nav below `lg`; persistent side nav from `lg+`
- Listing wizard: `max-w-2xl` on mobile; `lg:max-w-5xl` + sticky «ملخص الإعلان» column

## Components

shadcn/ui (Base UI) + Tailwind CSS v4 + Lucide. Add primitives only when a screen needs them.

Marketplace IA reference: [docs/references/sahibinden/DESIGN.md](references/sahibinden/DESIGN.md).

# UI system

Sprint 0 stub. Tokens and layout rules for AGARATİ.

## Language and direction

- Public chrome is **Arabic**
- Root document: `lang="ar"` `dir="rtl"`
- Mobile-first; desktop is an enhancement

## Color

| Token | Value | Use |
| --- | --- | --- |
| Primary | `#0F766E` | Actions, brand, focus ring |
| Muted foreground | `#57534E` | Secondary text |

Keep contrast readable on white surfaces. Do not introduce a second brand hue in Sprint 0.

## Property card

- Image frame aspect ratio **4 / 3**
- Never show a **public exact street address** — neighborhood / district only

## Search and listing

- Filters live in the **URL** (query params), not only in component state
- Default page size: **24**

## Favorites

Favorites are **P0**. Heart / save affordances may be stubbed in Sprint 0 but the product cannot launch without them.

## Shell

- Sticky header: `h-14` / `md:h-16`, `border-b`, `bg-background/95`, backdrop blur
- No public chat or messages links

## Components

shadcn/ui (Base UI) + Tailwind CSS v4 + Lucide. Add primitives only when a screen needs them.

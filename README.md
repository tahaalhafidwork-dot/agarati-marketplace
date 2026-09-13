# AGARATİ.COM

Focused Turkish / regional real-estate marketplace (Sprint 0 foundation).

Arabic UI chrome (`lang=ar`, `dir=rtl`). Mobile-first. Next.js App Router + TypeScript + Tailwind + shadcn/ui.

This sprint is **structure and placeholders only**. There is no real auth, database, or file storage.

## Requirements

- Node.js 20+
- npm

## Setup

```bash
npm install
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

## Routes

- Public: `/`, `/properties`, `/properties/[slug]`, `/agencies`
- Auth stubs: `/login`, `/register`, `/forgot-password`
- Dashboard stubs: `/dashboard`, `/dashboard/properties`, `/dashboard/favorites`, `/dashboard/contact-leads`, …
- Admin stubs: `/admin`, `/admin/properties`, `/admin/users`, `/admin/reports`

## Docs

Start with [`docs/DECISIONS.md`](docs/DECISIONS.md) and [`docs/UI_SYSTEM.md`](docs/UI_SYSTEM.md). Agent rules: [`AGENTS.md`](AGENTS.md), [`CLAUDE.md`](CLAUDE.md).

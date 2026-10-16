# Architecture — AGARATİ

Scale target: thousands of concurrent users, hundreds of thousands of listings.
Layers stay thin today; boundaries prevent scrape-then-rewrite later.

## Layers

```
app/                  → UI + route handlers (presentation)
domain/               → pure rules & types (no I/O)
application/          → use-cases / orchestration
infrastructure/       → Prisma, Supabase, Realtime, external I/O
lib/                  → transitional adapters + UI helpers + navigation catalog
lib/actions/          → thin "use server" adapters over application commands
features/             → feature status markers / thin barrels
```

### Import rule (enforced by convention)

- `domain` → nothing from `application` / `infrastructure` / `app`
- `application` → `domain` + `infrastructure` (and Prisma via `lib/db` until ports exist)
- `infrastructure` → implements I/O; may use Prisma/Supabase
- `app` / `components` → call `application` or thin `lib/*` / `lib/actions/*` facades
- `lib/actions/*` → adapters only (FormData → use-case → revalidate/redirect)

Existing `lib/*` remains stable for helpers; new browse/auth/favorites work prefers `application/*`.

### Concrete application modules (current)

| Module | Role |
| --- | --- |
| `application/listings/browse-page.ts` | Properties browse ViewModel (`loadPropertiesBrowsePage`) |
| `application/listings/commands/*` | Parse form, upload images, shared listing write helpers |
| `application/listings/messages/*` | Unread count + participant helpers |
| `application/favorites/*` | Server SSOT toggle + guest sync on login |
| `lib/navigation/*` | Single nav catalog + surfaces (header/drawer/bottom/dashboard/admin) |
| `infrastructure/realtime/*` | Supabase Realtime channel helpers |

### Favorites SSOT

| Context | Source of truth |
| --- | --- |
| Signed-in | Prisma `Favorite` |
| Guest / demo | `localStorage` (`lib/favorites-local`) |
| After login | `syncGuestFavoritesAction` merges guest IDs then clears local |

### Messages delivery

Realtime subscriptions on `Message` / `PropertyRequestMessage` with **silent polling fallback** (same intervals as before when Realtime fails). Mutations stay Server Actions.

**Ops (one-time):** In Supabase Dashboard → Database → Replication, enable realtime for `Message` and `PropertyRequestMessage`. RLS must allow participants to `SELECT` their rows.

### Characterization

```bash
npm run characterize
```

Locks browse query parse + nav href/label contracts before refactors.

## Why this helps at scale

| Concern | Layer | Later growth |
| --- | --- | --- |
| Listing filters / sort / search intent | `domain/listing` | Meilisearch adapter without rewriting pages |
| `loadPropertiesBrowsePage` / `fetchPublicListings` | `application/listings` | Keyset pagination, cache, read replicas |
| Session | `application/auth` + `React.cache` | Shared per-request, then Redis if needed |
| Prisma client | `infrastructure/db` | Connection pooling / multi-tenant |
| Unread / threads | Realtime + actions | Scale without 3s/12s polling under load |

## Sprint rule

Do not invent repositories for every table yet. Add a port only when a second
implementation appears (e.g. search index beside Postgres; favorites already has
server + guest cache; messages have Realtime + polling).

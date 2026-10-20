# Database

Prisma + PostgreSQL (Supabase). See [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

## Models

- **User** — id = Supabase Auth UUID; roles: SEEKER | LISTER | ADMIN
- **Listing** — category, deal, priceIqd, location slugs, status DRAFT|PENDING|ACTIVE|REJECTED
- **ListingImage** — storagePath in `listing-images` bucket
- **Favorite** — unique (userId, listingId) — launch blocker
- **ContactLead** — in-app interest request to listing owner

## Commands

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Without `DATABASE_URL`, public browse falls back to sample listings; mutating routes show setup guidance.

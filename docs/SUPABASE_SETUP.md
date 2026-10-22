# Supabase setup — AGARATİ

Free-tier project is enough for MVP launch blockers.

## 1. Create project

1. Open [supabase.com](https://supabase.com) → New project
2. Pick a region close to Iraq / Middle East
3. Set a strong database password (save it)

## 2. Environment variables

Copy [`.env.example`](../.env.example) → `.env.local` and fill:

| Variable | Where |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` (server only) |
| `DATABASE_URL` | Settings → Database → Connection string (URI). Prefer **Session mode** pooler for Next.js, append `?pgbouncer=true` if required |
| `DIRECT_URL` | Direct connection (non-pooler) for `prisma migrate` |
| `DATABASE_LIVE` | Set to `1` only if you intentionally use a local Postgres on localhost |

## 3. Auth

1. Authentication → Providers → Email → enable Email/Password
2. (Optional) disable “Confirm email” while developing locally

## 4. Storage bucket

1. Storage → New bucket → name: `listing-images`
2. Public bucket: **ON** (public read of listing photos)
3. Policies (SQL editor):

```sql
-- Authenticated users can upload into their own folder
create policy "listing images upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "listing images update own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "listing images delete own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read
create policy "listing images public read"
on storage.objects for select
to public
using (bucket_id = 'listing-images');
```

## 5. Migrate schema

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 6. First admin

After registering via the app, promote yourself in SQL:

```sql
update "User" set role = 'ADMIN' where email = 'you@example.com';
```

## Local Supabase (Docker)

Requires Docker Desktop running.

```bash
npx supabase start
# Copy keys from the CLI output into .env.local (see committed example values for local demo keys)
# DATABASE_LIVE=1 is required for localhost Postgres
npx prisma migrate dev --name init
```

Studio: http://127.0.0.1:54323 · API: http://127.0.0.1:54321 · DB: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

Storage policies for `listing-images` are applied via `supabase/seed.sql` (re-run on `supabase db reset` after Prisma migrate). Email confirmations are off in local `supabase/config.toml`.

## Local without keys

`npm run build` / `typecheck` work after `prisma generate`. Runtime routes that need DB/Auth return friendly errors until `.env.local` is set.

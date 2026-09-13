# Architecture

Stub. Expand when auth and data are wired.

## App

- Next.js App Router + TypeScript
- Route groups: `(public)`, `(auth)`, `dashboard`, `admin`
- Feature folders under `features/` stay thin until a sprint owns them

## Planned services (not connected in Sprint 0)

| Concern | Lock |
| --- | --- |
| Auth / session | Supabase Auth |
| Database | Prisma + PostgreSQL |
| Images | Supabase Storage |
| Search | URL filters first; Meilisearch later |
| Contact | ContactLead records |

## Sprint 0 rule

No SDK clients, env secrets, or server actions that talk to a live backend.

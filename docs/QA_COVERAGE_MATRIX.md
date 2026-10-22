# QA Coverage Matrix — Agarati Production

**Base URL:** https://agarati-marketplace.vercel.app  
**Started:** 2026-10-01  
**Source of truth:** current App Router pages + user-facing actions/capabilities (not internal components).

Status legend: `NOT TESTED` | `PASS` | `FAIL` | `PARTIAL` | `BLOCKED` | `N/A`

---

## Summary counters (update as you go)

| Metric | Count |
| --- | ---: |
| Total testable capabilities | 0 |
| Tested | 0 |
| PASS | 0 |
| FAIL | 0 |
| PARTIAL | 0 |
| BLOCKED | 0 |
| N/A | 0 |
| Coverage % | 0% |

---

## Matrix

| Area | Route/Capability | Persona | Desktop | Mobile | Result | Issue IDs |
| --- | --- | --- | --- | --- | --- | --- |
| Public | `/` home load + categories | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Public | `/` latest listings cards | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Public | `/` projects strip | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Public | `/` agencies strip | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Public | Header nav + CTAs | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Public | Hamburger / mobile drawer | Visitor | N/A | NOT TESTED | NOT TESTED | |
| Public | Bottom nav tabs | Visitor | N/A | NOT TESTED | NOT TESTED | |
| Public | Footer links | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Public | `/properties` browse list | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Search | Free-text search Arabic | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Search | Free-text search English | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Search | Search by listing number | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Search | Empty / nonexistent query | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Search | Partial title / punctuation / long query | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Filters | Deal: sale | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Filters | Deal: rent | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Filters | Deal: daily | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Filters | Property type each option | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Filters | Location city/district/neighborhood | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Filters | Price min only / max only / range | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Filters | Price min>max / zero / large | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Filters | Rooms options | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Filters | Area min/max/range | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Filters | Sort options | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Filters | Combo + URL sync + refresh/back | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Filters | Zero-results state | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Filters | Saved search toggle (logged-in) | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Categories | `/categories` and path segments | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing | Card → detail consistency | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing | `/properties/[slug]` gallery | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing | Share button | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing | Favorite guest (local) | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing | Favorite signed-in persist | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing | Phone / WhatsApp CTAs | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing | In-app message sheet | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing | Map / location display | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing | Advertiser link | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing | Similar listings | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing | Demo vs real badge clarity | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing | Direct URL logged-out / logged-in | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Auth | `/register` happy path | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Auth | Register validation empty/bad email/weak pw/dup | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Auth | `/login` success | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Auth | Login wrong password / unknown / empty | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Auth | `/forgot-password` flow | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Auth | Logout desktop | Buyer | NOT TESTED | N/A | NOT TESTED | |
| Auth | Logout mobile | Buyer | N/A | NOT TESTED | NOT TESTED | |
| Auth | Session persistence refresh | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Auth | Protected route redirect then login | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Dashboard | `/dashboard` overview counters | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Dashboard | `/dashboard/properties` list | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Dashboard | `/dashboard/properties/new` wizard | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Dashboard | Listing edit `/dashboard/properties/[id]/edit` | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Dashboard | Delete / hide / republish listing | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Dashboard | `/dashboard/favorites` | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Dashboard | `/dashboard/messages` inbox | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Dashboard | `/dashboard/messages/[listingId]` thread | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Dashboard | `/dashboard/contact-leads` | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Dashboard | `/dashboard/property-requests` CRUD | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Dashboard | Property request detail + messages | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Dashboard | `/dashboard/settings` profile/security/notifs | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Dashboard | Agency upgrade request | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Dashboard | Revoke other sessions / clear search / delete account UI | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Dashboard | Nav active state (properties vs new) | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Agency | `/dashboard/agency-projects` attach/propose | Agency | NOT TESTED | NOT TESTED | NOT TESTED | |
| Agency | Public `/agencies` directory | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Agency | `/agencies/[slug]` detail | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Projects | `/projects` directory | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Projects | `/projects/[slug]` detail + photo contribute | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Advertisers | `/advertisers/[slug]` | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Misc | `/services` `/support` `/contact` `/privacy` `/terms` | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Misc | `/support/report` submit | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Misc | `/agarly` `/basira` | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Misc | `/offline` PWA offline page | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing lifecycle | Draft → submit → pending | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing lifecycle | Admin approve → active | Admin | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing lifecycle | Reject + owner sees reason | Admin | NOT TESTED | NOT TESTED | NOT TESTED | |
| Listing lifecycle | Edit active / re-review behavior | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Images | Upload 1 / multiple / remove / persist | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Images | Formats JPG/PNG + size feedback | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Location | Wizard location selectors + map | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| AuthZ | Owner-only edit/delete | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| AuthZ | Non-owner blocked from foreign edit URL | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| AuthZ | Non-admin blocked from `/admin/**` | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| AuthZ | Visitor blocked from dashboard | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Messaging | Multi-user A↔B thread + isolation from C | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Messaging | Empty/long/Arabic/English messages | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Messaging | Unread badge / mark read | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Leads | Contact lead submit + owner inbox | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Reports | Report listing → admin visibility | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Admin | `/admin` overview | Admin | NOT TESTED | NOT TESTED | NOT TESTED | |
| Admin | `/admin/properties` moderate approve/reject | Admin | NOT TESTED | NOT TESTED | NOT TESTED | |
| Admin | `/admin/properties/[id]` | Admin | NOT TESTED | NOT TESTED | NOT TESTED | |
| Admin | `/admin/users` | Admin | NOT TESTED | NOT TESTED | NOT TESTED | |
| Admin | `/admin/projects` CRUD | Admin | NOT TESTED | NOT TESTED | NOT TESTED | |
| Admin | `/admin/property-requests` | Admin | NOT TESTED | NOT TESTED | NOT TESTED | |
| Admin | `/admin/reports` | Admin | NOT TESTED | NOT TESTED | NOT TESTED | |
| Admin | Agency upgrade review | Admin | NOT TESTED | NOT TESTED | NOT TESTED | |
| Mobile API | `/api/mobile/health` | N/A | N/A | N/A | NOT TESTED | |
| Mobile API | listings / favorites / categories endpoints | N/A | N/A | N/A | NOT TESTED | |
| PWA | manifest.webmanifest + icons | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| PWA | service worker / offline | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Journey | A Seeker end-to-end | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| Journey | B Advertiser end-to-end | Lister | NOT TESTED | NOT TESTED | NOT TESTED | |
| Journey | C Admin moderation | Admin | NOT TESTED | NOT TESTED | NOT TESTED | |
| Journey | D Returning user | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| UX | RTL / Arabic alignment | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| UX | Mobile overflow / bottom-nav overlap ~390px | Visitor | N/A | NOT TESTED | NOT TESTED | |
| UX | Desktop layout | Visitor | NOT TESTED | N/A | NOT TESTED | |
| UX | Empty states (fav/msg/leads/req) | Buyer | NOT TESTED | NOT TESTED | NOT TESTED | |
| UX | Invalid dynamic URLs 404 | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| UX | Back/forward/refresh state | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Perf | Perceived slow loads / spinners | Visitor | NOT TESTED | NOT TESTED | NOT TESTED | |
| Console | Runtime/network errors during journeys | All | NOT TESTED | NOT TESTED | NOT TESTED | |

**Inventory notes**
- 42 unique page routes discovered
- ~55 unique server actions (user-facing product capabilities derived above)
- Mobile API is thin adapter; mark PASS only if HTTP behavior verified
- Demo sample listings present when DB has no ACTIVE ads — treat as product behavior under audit

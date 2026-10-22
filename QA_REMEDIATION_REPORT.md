# Executive Summary

Open before: 20 (P0 1, P1 4, P2 8, P3 7). QA-022 stays closed.
Closed on production: 0
Not a bug: 2 (QA-003, QA-011)
Design-constrained: 0
Blocked: 18 code fixes are in the local working tree, but none is CLOSED. Production was not deployed and was not retested.
Remaining: every implemented fix still needs a clean deploy and a production retest. Deploy was not run.

Local production build: passed (`npm run build`, Next.js 16.3.5, TypeScript finished, 26 static pages). `npx tsc --noEmit` passed after the fixes.

No schema change. No database reset. QA listings were not deleted. No commit. Pre-existing dirty files were not reverted.

# P0

QA-014:
Root cause: `/dashboard/messages/[listingId]` treated contact method CHAT/ALL (or an empty method) as permission to read every message on that listing. The inbox correctly limited rows to fromId/toId. The direct page and `getMessagesAction` did not.
Fix: the page, metadata, `getMessagesAction`, and `markMessagesReadAction` now require the viewer to be the listing owner or an existing from/to participant. The message query is limited to rows where the viewer is fromId or toId. Logged-out users still redirect to login. A non-participant gets notFound / an empty action result. Starting a chat from the listing sheet is unchanged: the first message is created before the thread opens.
Regression: owner with no messages can still open an empty thread. A buyer who already sent a message still sees only their own rows. Header search was not touched.
Production: not deployed, not retested.
Status: BLOCKED

# P1

QA-008:
Root cause: the browse tab already had an empty state in this tree. The React #418 on that page matches a Base UI `Input` hydration mismatch inside the server-rendered filter form (client ids differ from the server HTML, so the list can be discarded). Browse also lists only OPEN requests, so a pending request is an empty list, not a crash.
Fix: the filter search control is now a native input, same pattern as the other selects on that form. Empty state left as it was.
Regression: create-request tab was not changed.
Production: not deployed, not retested.
Status: BLOCKED

QA-012:
Root cause: `updateListingAction` sets status PENDING and clears publishedAt on purpose. The wizard already says an edit returns to admin review. After save, the redirect landed on My Listings with only the badge, so the owner was not told the public URL would 404.
Fix: the pending rule was not changed. Update now redirects to `/dashboard/properties?notice=review`, and that page shows the existing amber notice pattern: the listing left the public site until an admin approves it.
Regression: create still redirects without that notice. Ownership check on update was not loosened.
Production: not deployed, not retested.
Status: BLOCKED

QA-015:
Root cause: two different sources. The header count used category/deal only, not area, price, city, rooms, or text. When a filter matched no live row, `fetchPublicListings` replaced the empty page with sample cards. A live marketplace of about 2 listings plus an area filter therefore showed a small count and about 13 sample cards.
Fix: sample cards are used only when the live public marketplace has zero listings. A filter that matches nothing stays empty. The header count is `listings.length`, the cards actually rendered. Category menu counts no longer borrow sample totals while any live listing exists.
Regression: sale, city, text search, and map still use `fetchPublicListings`. An empty database still falls back to samples.
Production: not deployed, not retested.
Status: BLOCKED

QA-024:
Root cause: one wizard submit could run `createListingAction` twice (double submit / a second server invocation). Each call inserted a listing and uploaded the photo. Disabling the button only after `pending` flips is too late.
Fix: the publish step sets a ref lock before the action runs and ignores a second submit. The server takes a transaction advisory lock on owner+title+price+location and, within 20 seconds, returns the listing just created instead of inserting another. Images upload only for the insert that actually created the row.
Regression: update listing does not use that lock. No schema change.
Production: not deployed, not retested. Not exercised with a second create, so the duplicate path was not re-run against the database.
Status: BLOCKED

# P2

QA-001:
Root cause: the home control is a submit button whose only handler was the form `onSubmit`. Enter reached that handler. The click path did not navigate in the browser session that filed the bug.
Fix: the same `go()` used by Enter now also runs from the button `onClick`. Header search was not edited.
Regression: header search component is untouched.
Production: not deployed, not retested.
Status: BLOCKED

QA-007:
Root cause: the overview rendered literal em dashes and never queried counts.
Fix: the three existing stats now read listing count, favorite count, and property-request count for the signed-in user. No new metrics. The description line already changed in the dirty tree was kept.
Regression: dashboard nav and other pages were not changed.
Production: not deployed, not retested.
Status: BLOCKED

QA-009:
Root cause: an empty description set `stepError` above the card, off the field the user was looking at, and the handler did not return after setting it.
Fix: the same error string now renders under the description field with the existing destructive text style. The validation rule is unchanged.
Regression: other step checks still block next/submit.
Production: not deployed, not retested.
Status: BLOCKED

QA-010:
Root cause: the public detail query only returns publicly visible listings, so the owner of a pending listing got the same 404 as a visitor.
Fix: visitors still get 404. If the signed-in user owns the non-public row, the page shows a short amber notice and links to edit and My Listings. The listing body is not rendered. Pending listings are not public.
Regression: a stranger still gets 404.
Production: not deployed, not retested.
Status: BLOCKED

QA-011:
Root cause: the forgot-password field is `type="email"` with no extra pattern. The server sends the address to Supabase and does not special-case `.test`. Reserved `.test` domains are not deliverable, and the failure seen in QA is that test mailbox, not a production rule that rejects normal mail.
Fix: none. Production validation was not loosened to accept `@agarati.test`.
Regression: none.
Production: not applicable.
Status: NOT A BUG

QA-013:
Root cause: the server requires an email or a phone, but both labels looked optional.
Fix: helper text and both labels now say one of the two is required. The server rule was not changed.
Regression: a report with an email and no phone still matches the previous successful path.
Production: not deployed, not retested.
Status: BLOCKED

QA-016:
Root cause: `/categories/apartments` rendered taxonomy rows and a count, and never rendered the listings that count referred to. Counts could also include sample padding while live rows existed.
Fix: a type or deal category page now lists cards from `fetchPublicListings` for that category and deal, and prints that list length. The row component is the existing result row. Sample padding in the menu counts was removed whenever the live marketplace is non-empty, so the menu count and the cards use the same live set.
Regression: the category menu links to `/properties` are unchanged. `/categories` root still has no card list.
Production: not deployed, not retested.
Status: BLOCKED

QA-017:
Root cause: `app/(public)/basira/page.tsx` already calls `redirect("/agarly")`. That is the intended behavior. Production still serves the old page because this tree is not what is deployed.
Fix: no further code change.
Regression: `/agarly` was not edited.
Production: not deployed, so `/basira` on production was not rechecked.
Status: BLOCKED

# P3

QA-002:
Root cause: the results subtitle said `حتى {pageSize} لاحقاً` (page size is 24), which reads as a placeholder rather than a cap.
Fix: the same line now says the page shows up to that many listings. Layout was not changed.
Regression: none beyond that string.
Production: not deployed, not retested.
Status: BLOCKED

QA-003:
Root cause: the home search slot (`data-ad-slot="home-search-banner"`) and the banner under latest listings (`data-ad-slot="home-below-listings"`) are two different reserved slots, not one component rendered twice.
Fix: none. Ad slots were not removed.
Regression: none.
Production: not applicable.
Status: NOT A BUG

QA-004:
Root cause: there is no artificial sleep. The detail route waits on the listing, then the session, then a second listings query for similar ads, while the existing loading UI is on screen. The gallery skeleton was not redesigned.
Fix: the similar-listings query now starts in parallel with the session read. The loading layout is unchanged.
Regression: similar listings are still capped at 3 and still exclude the current id.
Production: not deployed, not retested.
Status: BLOCKED

QA-005:
Root cause: min greater than max was applied as an empty filter with the generic empty copy.
Fix: the browse empty state now says the minimum price and/or area is above the maximum. The filter panel shows the same sentence under the price and area fields, using the existing destructive text style. The filter model is unchanged, so the invalid range still returns no rows.
Regression: a valid range does not show the sentence.
Production: not deployed, not retested.
Status: BLOCKED

QA-006:
Root cause: room filtering worked, but the result row did not print `rooms`, which already exists on the listing card.
Fix: the existing badge row now includes the room value when it is not empty or an em dash. No new card layout.
Regression: rows without a room count look the same.
Production: not deployed, not retested.
Status: BLOCKED

QA-021:
Root cause: the only save-search control lived in `AppSubHeader`, which is `md:hidden`. It appeared only after zoom narrowed the viewport under the md breakpoint.
Fix: the same `SaveSearchButton` is also rendered on the desktop title row that already shows the result title. The mobile header control is unchanged.
Regression: save/unsave action is the same server action.
Production: not deployed, not retested.
Status: BLOCKED

QA-023:
Root cause: the profile printed `locationLabel` and then appended `addressLine`. For this office both strings were `بغداد · المنصور`.
Fix: `joinLocation` prints one of them when one contains the other. No WhatsApp button was added. Phone/tel was left as it was.
Regression: a real street line that is not already in the label is still appended.
Production: not deployed, not retested.
Status: BLOCKED

# Additional Browser Findings

Rent filter:
Root cause: the same sample fallback as QA-015. Live listings in this marketplace are rent, so choosing rent did not change the set. Daily rent matched no live row and was replaced by sample cards, so it looked like only daily rent worked.
Fix: covered by the QA-015 fallback change. `deal=rent` and `deal=daily` already map to RENT and DAILY. No separate filter UI change.
Production: not deployed, not retested.
Status: BLOCKED

Share:
Root cause: `navigator.share` can exist and reject without a dialog (or resolve no visible sheet). Clipboard write then failed in that browser, and `window.prompt` is not a visible fallback there.
Fix: if share is missing or fails for a reason other than the user cancelling, the button copies the absolute URL with the clipboard API and then a textarea `execCommand("copy")`, and shows the existing check state. The button design is unchanged.
Production: not deployed, not retested.
Status: BLOCKED

Header search: not modified.

`/dashboard/contact-leads`: the redirect to property requests is the page's behavior. It was not changed.

# Security Regression

Messages: listing thread read, poll, and mark-read are participant-or-owner. Logged-out access still redirects. A third user no longer receives the other parties' message bodies from the page or `getMessagesAction`.
Admin: admin routes were not edited.
Ownership: listing update still rejects a non-owner. Public detail still hides non-public listings from everyone except the owner notice above.
Requests: property-request message queries were already peer-scoped. They were not redesigned. The request filter input change does not change who can read a request.

# Filter Regression

Not re-run in a browser after the patch. Code paths:
Sale / rent / daily: same `deal` query key. Empty live results no longer become sample cards.
Price and area: same where-clause bounds, plus the min>max message.
Bedrooms: unchanged filter; cards now show the room value.
City, sort, search, clear, refresh, back/forward, direct URL: still `parseListingQuery` and `fetchPublicListings`. Header count is the rendered list length.

# Critical Journeys

Not re-run after the patch. No local login session was driven through visitor, buyer, lister, or admin. The production build compiled those routes.

# Build

Result: passed. `npm run build` on this machine, Next.js 16.3.5, compiled successfully, TypeScript finished, static generation 26/26.

# Deployment

Production URL: https://agarati-marketplace.vercel.app
Deployment result: BLOCKED. `vercel deploy` would upload the whole dirty working tree, including a large set of unrelated local edits. Those files were not reverted and were not committed. Production data was left as it was.

# Git Changes

Files edited for this task (other dirty files were already dirty and were not part of these fixes):

- app/dashboard/messages/[listingId]/page.tsx
- lib/actions/listings/messages.ts
- lib/listing-service.ts (also had a pre-existing comment-only hunk; it was kept)
- application/listings/browse-page.ts
- components/browse/properties-browse-view.tsx
- components/property/listing-result-row.tsx
- app/(public)/properties/[slug]/page.tsx
- components/home/home-search-bar.tsx
- components/property/listing-share-button.tsx
- lib/actions/listings/create-update.ts
- components/listing-wizard/listing-wizard.tsx
- components/listing-wizard/steps/publish-step.tsx
- app/dashboard/page.tsx (also had a pre-existing description hunk; it was kept)
- app/dashboard/properties/page.tsx
- components/support/report-form.tsx
- app/(public)/agencies/[slug]/page.tsx
- components/property-requests/property-request-filters.tsx
- components/search/listings-filter-fields.tsx
- app/(public)/categories/[[...path]]/page.tsx
- QA_REMEDIATION_REPORT.md

`app/(public)/basira/page.tsx` was already `redirect("/agarly")` and was not modified.

# Remaining Issues

Production still has the reported bugs until a deploy that contains only these fixes. That deploy is blocked by unrelated dirty files.

QA-003 and QA-011 are not code bugs.

Nothing else from the untested list (Expo, Bearer favorites, account deletion, email/password change, republish, WhatsApp clicks, project creation, agency upgrade) was changed.

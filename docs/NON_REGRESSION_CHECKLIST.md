# Non-regression checklist — architecture refactor

Manual pass after `npm run typecheck` / `npm run characterize` / `npm run build`:

- [ ] `/properties` list + map FAB + filters unchanged
- [ ] Listing detail: favorite (guest → login, signed-in server, demo local)
- [ ] After login: guest favorites appear in `/dashboard/favorites` once
- [ ] Messages badge updates; thread still sends/receives
- [ ] New listing wizard: 4 steps submit unchanged
- [ ] Mobile: header drawer links, bottom tabs labels/hrefs, dashboard nav
- [ ] Admin nav items unchanged

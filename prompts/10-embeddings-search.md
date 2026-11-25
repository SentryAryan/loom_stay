# Feature: Embeddings-powered Search

Status: done

## Goal
The Search tab (and Home's search pill, which opens it) stops using the 12 local California stays and the regex ranker. It asks Sanity: exact constraints (price, category, amenities, pets) are GROQ filters with params, and everything else in the sentence ranks the survivors through Dataset Embeddings (`text::semanticSimilarity()` inside `score()`). Results are the same 30 stays Home shows.

## Context & Docs
- Dataset Embeddings are on for `vxnms1ub/production` (plan 09; projection: title, summary, description, highlights, vibes, category, amenities, city, region, country). Embeddings only see the document itself and never filter.
- Checked live while planning (anonymous, published perspective, both `apicdn` and `api` hosts):
  - `*[...filters...] | score(text::semanticSimilarity($q)) | order(_score desc)` works, e.g. "quiet cabin to unplug" under $200 returns cabins first and nothing over $200.
  - Combined filter test (`max 300`, category cabin, amenity hot-tub, pets true, q "quiet") returns exactly the 2 stays that satisfy every filter, ranked by `_score`.
  - An empty `$q` does not error; every `_score` is 0, so a tie-break order is needed.
  - `$max == null` works as an "any price" guard, also through POST with `"max": null`.
  - POST `{query, params}` to `https://vxnms1ub.api.sanity.io/v2025-02-19/data/query/production` works anonymously.
- Subset test for amenities: `count($amenities[!(@ in ^.amenities)]) == 0` (every wanted amenity is in the stay's list).
- Sanity amenity ids that exist: pool, ocean-view, air-conditioning, kitchen, hot-tub, fireplace, mountain-view, parking, garden, wifi, workspace, city-view, lake-view. The app only filters on its 8 `AmenityId` values; `pets` maps to `petsAllowed == true`, not to the amenities array. Categories: beach, cabin, city, villa.
- Existing code this builds on: `src/features/stays/use-stays.ts` (Home fetch, `toStay`), `search-stays.ts` (`parseQuery`, chip edit helpers, `sortStays`), `search-state.tsx`, `src/app/(tabs)/search.tsx`, `sanity-config.ts`.

## Decisions & Tradeoffs
Decided with the user:
1. **App talks to Sanity directly**, no API route. The dataset is public and Home already does this. Trade-off: no Clerk check on search, which is fine because it reads public content only. (The old plan 09 note about a Clerk-verified route is dropped for now; revisit if the dataset ever goes private.)
2. **No Jev in this plan.** The existing regex parser stays the source of price, pets, amenities and category. Embeddings handle soft intent. AGENTS.md says "Typed decisions: Jev, called from API routes"; nothing here needs one.
3. **Remove the 12 local stays**, keep the `Stay` type, `AmenityId`, `StayCategory` and the label maps (many files import them).

Defaults picked (change if wrong):
- **Text sent to embeddings = the leftover words** (`parsed.words.join(" ")`) after price, amenities and category are stripped. Those parts are already hard filters, so embedding them again adds noise. If nothing is left, `$q` is `""` and the order falls back to rating.
- **One constant GROQ string, no interpolation**, values only through params (AGENTS rule). Filters are written so empty arrays and a null price mean "no constraint".
- **Order:** `_score desc, rating desc, reviewCount desc`. "Best match" keeps the server order; the other sorts re-sort the (at most 30) rows in memory with the existing `sortStays`.
- **POST to the live API host** (not the CDN, not GET): the typed sentence goes in the request body instead of the URL, and per-guest text is not cacheable anyway. The anonymous POST was tested.
- **Fetch timing unchanged:** Search commits on submit, and chips/filter sheet edits refetch because they change the parsed filters. No fetch while typing.
- **Place words, guests and dates are not parsed** (not today either). A place name such as "Goa" goes into the semantic text, and the index includes city, region and country, so it ranks. It does not hard-filter. Say so if you want a place filter later.
- **While refetching, the previous results stay on screen** (dimmed or with a small spinner) so chip taps do not flash an empty list. First load shows a loading state; failure shows an error with Retry; zero rows shows the existing empty state.

## Step-by-Step Implementation
1. **Share the Sanity stay mapping.** Move the stay projection, `SanityStay`, `toStay` and the image params out of `use-stays.ts` into `src/features/stays/sanity-stay.ts`. `use-stays.ts` imports them; Home behaves the same.
2. **Query builder.** Add `src/features/stays/search-query.ts` with the constant GROQ below and `buildSearchRequest(parsed: ParsedQuery)` returning `{ query, params }` with params `max`, `categories`, `amenities` (without `pets`), `pets`, `q`.
   ```groq
   *[_type == "property" && defined(slug.current)
     && ($max == null || nightlyPrice <= $max)
     && (count($categories) == 0 || category in $categories)
     && count($amenities[!(@ in ^.amenities)]) == 0
     && ($pets == false || petsAllowed == true)
   ] | score(text::semanticSimilarity($q))
     | order(_score desc, rating desc, reviewCount desc) { <same projection as Home> }
   ```
3. **Fetch hook.** Add `use-search-results.ts`: `useSearchResults(parsed)` returns `{ status: "loading" | "error" | "empty" | "ready", stays, isRefreshing, retry }`. It POSTs the request with an `AbortController` and a 10s timeout, aborts the previous request when the filters change, and ignores late responses. Small in-memory cache keyed by the request JSON so going back to a recent search is instant.
4. **Search screen.** `search.tsx` uses the hook instead of `searchParsed(filters)`, renders loading / error (Retry) / empty (existing copy) states, keeps `sortStays` for non-"Best match" sorts, and keeps the live-region count.
5. **Trim the old ranker.** In `search-stays.ts` remove the `stays` import, `matchesConstraints`, `softScore`, `searchParsed` and `searchStays`; keep `parseQuery`, the `with*` helpers, `sortStays`, `countActiveFilters`, `SortId` and labels.
6. **Remove sample data.** In `stays.ts` delete the `stays` array and the `photo` helper, update the header comment, keep types and labels.
7. **Docs.** Update AGENTS.md ("Home, Search and tabs" and "Soft intent") to say Search is embeddings-powered; remove the "until embeddings-powered Search ships" sentence. Set this plan to `done` with a Result section.

## Verification
- `npx tsc --noEmit` and `npx expo lint` pass.
- Run the same query and params through the Sanity MCP (or Vision) for the 5 sentences below and confirm the app shows the same order.
- On the emulator (Metro on 8081, no sign-out):
  1. Home pill: "quiet pet friendly cabin with a hot tub under $300" shows only cabins at or under $300 with pets and a hot tub, ranked by meaning.
  2. Search: "cozy fireplace" returns many stays, with fireplace stays near the top.
  3. Tap a category chip and a price change in the filter sheet: list refetches, previous list stays visible meanwhile.
  4. Sort by Price low to high re-sorts the same rows.
  5. A sentence with nothing matching the filters (for example "villa under $10") shows the empty state.
  6. Airplane mode then submit: error state with Retry, and Retry works after reconnecting.
- Typed text is not in any URL (POST body only) and nothing typed is sent to PostHog.
- No Search code path reads `stays.ts` sample data (grep for the removed export).

## Result
Search now runs on Sanity: exact filters as GROQ params, leftover words ranked by Dataset Embeddings. Files: new `sanity-stay.ts`, `search-query.ts`, `use-search-results.ts`; changed `use-stays.ts`, `search-stays.ts`, `stays.ts` (sample array removed), `sanity-config.ts`, `src/app/(tabs)/search.tsx`, `src/app/filters.tsx`.

Verified on the Android emulator (Metro 8081):
- "quiet pet friendly cabin with a hot tub under 300" from Home: 2 stays (Wooden Cabin $92, Modern Cabin $289), chips Cabins, Under $300, Hot Tub, Pet Friendly.
- "quiet romantic getaway": 30 stays; top three match the same query run through the Sanity MCP (Riverside Cottage, Tea Estate Cottage, Modern Cabin).
- Airplane mode: "Couldn't search stays" with Try again; after reconnecting, Try again loads 30 stays.
- Filter sheet: Cabins shows "Show 7 stays", matching 7 cabins in Sanity.
- `npx tsc --noEmit`: no errors under `src/` (6 existing errors in `ECC/` and the studio's `node_modules`); `npx expo lint src` clean.

Found and fixed during verification: reading the cache during render left the list stuck on "Searching…" because React Compiler memoized that read; the cache is now read only inside the effect.

Notes: a seed photo for "Riverside Cottage on the Ganges" is a conference room (existing content issue, not this change).

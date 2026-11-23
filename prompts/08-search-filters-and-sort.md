# Feature: Search filter sheet and sort menu

Status: done

## Goal
Make the two controls that `Search results@2x.png` shows but 07 left out actually work on the local stays: a filter icon in the search field that opens a filter sheet, and a "Sort by" row that opens a sort menu. Also done in this change: Home's header uses the logo lockup (symbol + wordmark) like onboarding and the auth screens.

## Context & Docs
- Sheets are native routes with `presentation: 'formSheet'` in the root Stack (https://docs.expo.dev/router/advanced/modals/). `sheetAllowedDetents` takes fractions (Android allows at most 3), `sheetGrabberVisible` is iOS only, and on Android a formSheet draws no native header, so the title and buttons are part of the sheet content.
- Design system "Bottom Sheet Drawers" (`assets/design-systems/v1/light_mode/DESIGN.md`): drag handle, sticky header with `headline-lg` title and a circular dismiss button, scrolling body, sticky bottom bar with "Clear all" left and a primary pill ("Show N stays") right; half sheet (about 55%) for quick filters. "Action Sheets": stacked options with inner dividers and a separate Cancel pill.
- Builds on `07-home-and-search.md` (`search-stays.ts`, `filter-chips.tsx`, `search.tsx`).
- No new dependencies.

## Decisions & Tradeoffs
Answered by the user: build both the filter sheet and the sort menu now; Home uses the lockup logo.

Defaults I picked (change any before approving):
- **Shared search state.** Filters, sort and the field text move into a small context provider (`src/features/stays/search-state.tsx`) mounted in the root layout, because the sheets are root routes that the Search tab can't hand state to directly. Home calls `startSearch(text)` and then opens the Search tab; the `?q=…&t=…` params and the `key` remount trick in `search.tsx` go away.
- **Filter sheet contents** (all apply live, no Apply step): Category (Cabins, Beach, City, Villas), Price (Any, Under $150, $200, $300, $400; a parsed value like $250 shows as an extra selected chip), Amenities (multi-select chips for all 8 amenities, "Pet Friendly" for pets). Header: "Filters" with a count badge and a round close button. Bottom bar: "Clear all" and "Show N stays", which closes the sheet. Half-sheet detent, with full height available (`[0.6, 1]`).
- **Price control is preset chips, not the mockup's range slider with histogram.** A slider needs a gesture build of its own or a new dependency; the presets cover the same use. Say if you want the slider and I'll plan it separately.
- **Sort sheet** is an action-sheet style list (Best match, Price: low to high, Price: high to low, Top rated) with a check on the current one and a Cancel pill. Choosing one applies it and closes the sheet. One detent (`[0.42]`).
- **Sort logic.** `sortStays` in `search-stays.ts`. Best match keeps today's ranking (soft-word score, rating, reviews). The others are stable sorts on the filtered list.
- **Search screen changes.** The filter icon sits at the right of the search field and shows a small count badge when filters are active. The "Sort by" row becomes a button with a chevron and shows the current choice. Both have accessibility labels and 44pt targets.
- **Motion** (`expo-animation` gate): the sheets use the platform's own slide and detents (no custom motion). Option and chip presses reuse the 0.97 scale and 150ms color transition from 07. The count badge and "Show N stays" text change without animation (tens of times a day, nothing to explain). Reduced motion needs nothing extra.
- Sheets are routes `src/app/filters.tsx` and `src/app/sort.tsx`, guarded for signed-in guests like `design-system`.

## Step-by-Step Implementation
1. `search-stays.ts`: add `SortId`, `sortLabels`, `sortStays`, `countActiveFilters`.
2. `search-state.tsx`: provider and `useSearchState` (text, filters, sort, `startSearch`), mounted in `src/app/_layout.tsx` around the Stack.
3. `src/app/filters.tsx` and `src/app/sort.tsx` (+ small shared `sheet-header.tsx`), registered in the root Stack as `formSheet` routes.
4. `search.tsx`: read state from the context, add the filter icon and the sort button; apply `sortStays`. `home.tsx`: `startSearch(text)` then `router.navigate("/search")`.
5. Lint, type check, close out (`AGENTS.md`, graph).

## Verification
- `npx tsc --noEmit` (app code) and `npx expo lint` pass.
- AVD via adb: Home search then Search; open the filter sheet from the icon, toggle category, price and amenities and watch the "Show N stays" count and the list change; Clear all; close with the button, the back gesture and a swipe; badge on the icon matches the active count.
- Sort: each of the four options reorders correctly (check prices and ratings against the data), the label updates, Cancel keeps the old sort.
- Typing a new sentence in Search resets filters but keeps the chosen sort; Home search sets everything fresh.
- Light and dark, and a 200% font scale glance on both sheets. iOS can't be checked here.

## Result
Built as planned and checked on the Android emulator; `tsc` and `expo lint` clean.

- Filter icon (with an active-count badge) opens the filter sheet: category, price steps, amenities, "Clear all" and "Show N stays"; every change applies live and the chips behind it update. "Sort by" opens the sort sheet (Best match, Price low to high, Price high to low, Top rated, Cancel). Verified: counts, prices ordering ($198, $214, $236...), Clear all, dark mode, closing with the button and the back key. Home lockup logo done.
- Fixes found while testing: the filter sheet's bottom bar was pushed off screen on Android (content gets no bounded height) and then sat under the gesture bar (detent is a fraction of the screen below the status bar), both fixed in `filters.tsx`; the Search field kept the previous sentence after a new Home search (Android ignores text pushed into a tab that is off screen), fixed by remounting it with `key={searchId}`; a matching amenity could be hidden behind other tags, so result tags now show the filtered amenities first.
- Not checked: iOS (no Mac); the iOS sheet uses `flex: 1` and the grabber, untested. Sheet slide animation is the platform's own.
- Note: after "Clear all" the Search field still shows the old sentence until the next submit; the chips and count show the truth.
- Price is preset steps, not the mockup's range slider.

# Feature: Home screen, native tabs and local search

Status: done

## Goal
Build the Home screen from `assets/images/prompt-images/designs/Home@2x.png` with realistic local stay data, put the signed-in app inside Expo Router's native tab bar (Home, Search, Trips, Profile), and let a guest type a sentence into Home's search bar and land on a Search screen (`Search results@2x.png`) showing matching stays. Add subtle, smooth motion following the `expo-animation` skill.

## Context & Docs
- Expo SDK 58, `expo-router ~58.0.32`. Native tabs: `NativeTabs` from `expo-router/native-tabs` (`NativeTabs.Trigger` with `Icon` (`sf` for iOS, `md` for Android) and `Label`). Docs: https://docs.expo.dev/versions/v58.0.0/sdk/router/native-tabs/
- Native tabs facts that shape the code: Android wraps each tab screen in a SafeAreaView and applies only the bottom inset; iOS applies automatic content insets to the first scroll view. No header is drawn, so screens add the top inset themselves with `useSafeAreaInsets`.
- Animation: `react-native-reanimated 4.7.1` (already installed). Skill rules used: CSS transitions for press/chip state, layout animations for mount/filter changes, `useReducedMotion`, `transform` + `opacity` only, tab switches never animate.
- Design: `Home@2x.png`, `home.dc.html` (exact values), `Search results@2x.png`, `search.dc.html`.
- No new dependencies. `expo-image`, `react-native-reanimated`, `@expo/vector-icons` and `react-native-safe-area-context` are already installed.

## Decisions & Tradeoffs
Answered by the user: Unsplash photos (hotlinked, credit in the data file); all four tabs, Trips and Profile as stubs; category chips filter Home in place.

Defaults I picked (change any of these before approving):
- **Routes.** New `src/app/(tabs)/` group with `_layout.tsx` (NativeTabs), `home.tsx`, `search.tsx`, `trips.tsx`, `profile.tsx`. `/home` stays a valid URL (groups don't appear in paths), so `sso-callback` and the sign-in redirects keep working. Root `_layout.tsx` swaps the protected `home` screen for `(tabs)`; `design-system` stays protected. The old `src/app/home.tsx` is deleted.
- **Tab bar is the platform's.** The mockup's floating red pill can't be built with native tabs (iOS 26 draws its own glass bar; Android draws Material navigation). Tint comes from `primary-container`. Reported as a design difference.
- **Search bar.** The tinted pill on Home is a real `TextInput` (placeholder "quiet pet friendly cabin with hot tub"). Return key ("search") or the arrow button goes to the Search tab with the text as `?q=`. The arrow is disabled while the field is empty. The magnifier button at the top right focuses the field.
- **Search logic (local stand-in until Sanity).** `search-stays.ts` is a pure function. Code parses hard constraints from the sentence: price (`under $300`, `below 300`), pets, amenities (hot tub, pool, fireplace, ocean view), category (cabin, beach, city, villa). These filter. Soft words (quiet, cozy, secluded, romantic) only rank, through a `vibes` list on each stay, as embeddings will later. Rating breaks ties. Same rules as `AGENTS.md`: prices are parsed in code, ranking never filters.
- **Search screen** follows the design: back button, editable query field, filter chips built from what was parsed (tap to remove a constraint), "N stays", "Sort by Best match" as plain text (one sort only, so no fake dropdown), result rows with in-memory heart toggle (not persisted). Left out: the sliders/filter button (no filter sheet exists yet). Empty query shows all stays; no matches shows an empty state.
- **Stay cards on Home.** Press does nothing yet: there is no property details screen in this plan. Cards still get press feedback and an accessibility label. Reported in Notes.
- **Greeting and avatar** come from Clerk (`user.firstName`, initials from first and last name); falls back to "Hey there" and the first letter of the email.
- **Gradient over the photo** uses React Native's `experimental_backgroundImage` linear-gradient style with the `scrim` color from the theme, so no gradient library is added. Falls back to a solid `scrim` tint if the style is unsupported on the device.
- **Haptics skipped.** `expo-haptics` isn't installed and press feedback is visual. Adding it would need approval.

Animation gate (frequency tier and purpose):
| Motion | Tier | Purpose | Tool |
| --- | --- | --- | --- |
| Tab switching | 100+/day | none | native tabs, no animation |
| Press scale 0.97 (cards, chips, buttons, rows) | tens/day | feedback | CSS transition, 100-150ms ease-out |
| Chip active color | tens/day | state indication | CSS transition on background and text color, 150ms |
| Home first mount: header, search pill, chips, first cards fade up 8px, 40ms stagger | occasional | prevent a jarring pop-in | layout animation `entering`, ease-out, about 250ms |
| Chip filter changes the card list | tens/day | spatial consistency | `LinearTransition` plus fade for cards (Home list is a short ScrollView, not virtualized) |
| Photo load | every card | prevent a jarring change | `expo-image` `transition={200}` with a tinted placeholder |
| Heart toggle | tens/day | feedback | spring scale pop, `dampingRatio: 0.8` |
| Search result rows | virtualized list | none | no per-row `entering` (skill rule); photos fade only |

Reduced motion: drop translate and scale, keep opacity changes (`useReducedMotion`, `ReduceMotion.System` on layout animations).

## Step-by-Step Implementation
1. **Data.** `src/features/stays/stays.ts`: `Stay` type (id, title, city, state, category, rating, reviewCount, pricePerNight, amenities, petFriendly, vibes, imageUri, imageAlt) and 12 realistic California stays: Modern Cabin with Hot Tub (Lake Arrowhead, $289, 4.9, 342), Oceanview Villa with Private Pool (Malibu, $412, 4.8, 128), A-Frame in the Redwoods (Monte Rio, $236, 4.9, 96), Designer Home in Wine Country (Napa), plus beach, city and villa stays. Unsplash photo ids are checked to load before use. Shape mirrors the future Sanity fields.
2. **Search logic.** `src/features/stays/search-stays.ts` (`parseQuery`, `searchStays`) as described above.
3. **Components** in `src/features/stays/`: `stay-card.tsx` (Home card), `stay-row.tsx` (Search row), `category-chips.tsx`, `ai-search-bar.tsx`, `filter-chips.tsx`. Shared tokens only; no hex values, no raw font sizes. New tokens, if any, are listed in the report as proposed.
4. **Tabs.** `src/app/(tabs)/_layout.tsx` with `NativeTabs` (house, magnifyingglass, calendar, person; Material equivalents on Android). Update root `_layout.tsx` guards. Delete `src/app/home.tsx`.
5. **Home** `src/app/(tabs)/home.tsx` per the design, with the animations in the table.
6. **Search** `src/app/(tabs)/search.tsx` reading `q` from the route params, with the states above.
7. **Stubs.** `trips.tsx` empty state; `profile.tsx` with the Sign out button and the temporary "View design system" button moved from the old Home.
8. **Close out.** Lint and type check, verification below, update `AGENTS.md` (routes, tabs, stays feature) and refresh the graphify graph.

## Verification
- `npx tsc --noEmit` (app code) and `npx expo lint` pass.
- Metro on 8081; check it first, start `npx expo start --dev-client --tunnel --port 8081` if not running.
- AVD via adb, screenshots compared with `Home@2x.png` and `Search results@2x.png`; every difference listed and fixed.
- Type a sentence in the Home pill, submit: lands on Search with matching stays and parsed chips. Try "quiet pet friendly cabin with hot tub under $300", "beach house", and nonsense (empty state).
- Chip filters on Home, chip removal on Search, tab switching, back button, heart toggle.
- Dark mode and 200% font scale glance on the AVD.
- iOS can't be checked here (no Mac); the user checks on the phone.

## Result
Built as planned, checked on the Android emulator (light and dark, 200% font scale glance), `tsc` and `expo lint` clean.

- Home matches the design at 411dp width; chips wrap differently than the 390pt mockup because the screen is wider. Cabins, Beach, City and Villas use `MaterialCommunityIcons` (fir tree, waves, building, palm) to match the design.
- Typing a sentence and pressing return opens Search with parsed chips and ranked stays; chip toggles, empty query (all 12), tab taps, heart toggle and Home chip filtering all worked.
- Extra fixes found while testing: `expo-image` ignores `className` (photos were missing until wrapped in a View); a signed-in cold start at `/` showed "Unmatched Route", fixed with `src/app/+not-found.tsx`; Android tabs show all four labels (`labelVisibilityMode="labeled"`).
- Not checked: iOS (no Mac), press scale and layout animations by eye (they are className transitions and layout animations that can't be judged from a screenshot).
- Differences from the design: platform tab bar, scrim is the theme `scrim` token (lighter than the mockup's 78%), `displayLg` line height is 44 where the mockup used 40, no filter button or sort dropdown on Search.
- Dark mode: the search pill uses the dark design system's `tertiary-fixed`, which is bright mint green.

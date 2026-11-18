# Feature: Onboarding flow into authentication

Status: done

## Goal
A three-slide onboarding screen built from `assets/images/prompt-images/onboarding.png` (full-bleed photo, location chip, bottom sheet with progress, headline, body, primary and Google buttons), implemented with our design system, wired into placeholder sign-up and sign-in screens. Skip goes to a guest home.

## Context & Docs
- Design reference: `assets/images/prompt-images/onboarding.png`. It is a layout reference only: the brand is "roam", the yellow button and purple progress bar do not follow our system. Our `Logo`, `primary-container` coral and tokens replace them.
- Design system: `global.css` tokens, `AppText`, `Button`, `Logo`, `useThemeColors` (see `prompts/02-design-system.md`, `03-brand-mark.md`).
- Docs to read before building (SDK 58): expo-router (route groups, `router.push/replace`, `Stack.Screen options`) and expo-image under https://docs.expo.dev/versions/v58.0.0/, plus `@expo/vector-icons`.
- Clerk and real auth are out of scope (separate plan); there is no auth code in the repo yet.

## Decisions & Tradeoffs
Confirmed with the user:
- **Flow:** 3 swipeable slides (photo, location chip, headline, body change per slide; progress segments track the slide).
- **Auth target:** placeholder sign-up and sign-in screens in a new `(auth)` route group, built from our design system. No Clerk yet.
- **Skip:** goes to the home screen as a guest.
- **First launch:** onboarding shows every launch for now. No "seen" flag and no storage dependency; added together with real auth.
- **Icons:** add `@expo/vector-icons` (new dependency, approved) for the map pin and arrow. The Google "G" is a multicolor SVG via the already-installed `react-native-svg`.

Defaults I picked (say so if you disagree):
- **Routes:** `src/app/index.tsx` becomes onboarding (first screen). The current home placeholder (logo, tagline, temporary "View design system" button) moves to `src/app/home.tsx`. Auth: `src/app/(auth)/_layout.tsx`, `sign-up.tsx`, `sign-in.tsx`. Root `_layout.tsx` hides the header for `index` and `home`.
- **Buttons:** slides 1 and 2 show "Next" (advances the pager); slide 3 shows "Get started" (opens sign-up). The design shows "Get started" on slide 1, which would skip the other slides. "Continue with Google" is always visible and opens sign-in (placeholder until Clerk SSO).
- **Pager:** horizontal paging `FlatList` of photos behind the sheet; the sheet text crossfades (Reanimated `FadeIn`) when the index changes. Swiping works on the photo area; the Next button also advances. Next slide image is prefetched.
- **Layout:** photo fills the screen; sheet is absolute at the bottom (`bg-surface-container-lowest`, `rounded-t-xl`, `shadow-level-4`, `px-lg`). Safe-area insets from `react-native-safe-area-context` position Logo/Skip and the bottom padding.
- **Type:** headline `type-display-lg-mobile` (28/34 ExtraBold), body `type-body-lg` in `text-on-surface-variant`, Skip `type-headline-sm`, chip `type-label-md`.
- **Button changes:** `Button` gains `leading` and `trailing` slots and `justify="center" | "between"` so the arrow sits at the right edge as in the design. Existing usages unchanged.
- **Slide content (mine, replace freely):**
  1. "Find a stay that fits your story" / "From mountain cabins to oceanfront villas, Loom Stay helps you find unforgettable stays for every kind of trip." / chip "Whistler, BC" / mountain cabin at sunset.
  2. "Just say what you want" / "Describe your stay in one sentence, like a quiet, pet friendly cabin with a hot tub under $300 a night, and see the best matches first." / chip "Big Sur, CA" / coastal stay.
  3. "Answers you can trust" / "Ask about booking and house rules for any stay and get the host's and Loom Stay's own words, with the source." / chip "Lake Tahoe, NV" / lakeside cabin interior.
- **Images:** Unsplash hotlinks (`images.unsplash.com/photo-<id>?auto=format&fit=crop&w=1200&q=80`), three photos matching the slide moods. Each URL is checked with an HTTP request before use; photographer credits are recorded in `slides.ts` comments. Photos load through `expo-image` with a `surface-container` placeholder, so a failed image leaves a calm background instead of a broken view.

## Design mapping and proposed new tokens
| Design | Our implementation |
| --- | --- |
| "roam" wordmark | `Logo` lockup in a glass pill, so it stays legible on any photo (design places it directly on the sky) |
| Skip pill (light, translucent) | glass pill, `type-headline-sm`, min 44pt tall |
| Location chip (dark translucent, white text, pin) | `bg-scrim` pill, `on-scrim` text, `Ionicons` pin |
| Progress segments (purple active) | 3 bars, active `bg-primary-container`, inactive `bg-surface-container-high` |
| Yellow "Get started →" | `Button` primary, lg, trailing arrow (coral; gold is reserved for ratings) |
| Outlined "Continue with Google" | `Button` secondary, lg, Google "G" leading |
| Asymmetric curved sheet top | symmetric `rounded-t-xl` (24); the exact curve is not a token |

Proposed new tokens in `global.css` (`@theme` + `:root` + dark), mirrored in `src/theme/colors.ts`:
- `glass`: light `rgba(255, 255, 255, 0.8)`, dark `rgba(19, 19, 21, 0.72)`. Translucent pill background; no blur dependency.
- `on-scrim`: `#ffffff` in both themes, text and icons on the dark `scrim` chip.

## Step-by-Step Implementation
1. `npx expo install @expo/vector-icons` (SDK-matched).
2. `global.css` and `src/theme/colors.ts`: add `glass` and `on-scrim`.
3. `src/components/button.tsx`: add `leading`, `trailing`, `justify`.
4. `src/components/google-logo.tsx`: four-color Google "G" via `react-native-svg` (official logo geometry).
5. `src/features/onboarding/slides.ts`: slide data (copy, chip text, image URL, alt text, credit).
6. `src/features/onboarding/progress-segments.tsx` and `hero-pager.tsx`: segments (progressbar role, "Step n of 3") and the photo pager with prefetch.
7. `src/app/index.tsx`: onboarding screen composing the pieces; navigation: Skip `router.replace("/home")`, last-slide primary `router.push("/sign-up")`, Google `router.push("/sign-in")`.
8. `src/app/home.tsx`: previous home content moved as is, including the temporary design-system button.
9. `src/app/(auth)/_layout.tsx`, `sign-up.tsx`, `sign-in.tsx`: placeholder screens (Logo, heading, one line saying real sign-in arrives next, link to the other screen, "Browse as a guest" to home). No fake form fields.
10. `src/app/_layout.tsx`: header options for `index`, `home`, `(auth)`.
11. `src/app/design-system.tsx`: show `glass` and `on-scrim` swatches.
12. `AGENTS.md`: record routes and flow, icon library, new tokens, which screens are placeholders (keep under 150 lines).
13. Close out this plan: `## Result`, `Status: done`.

## Verification
- `npx tsc --noEmit` (ignore the unrelated `ECC/` errors), `npx expo lint`, `npx expo-doctor`, `npx expo export --platform ios` all pass.
- The three Unsplash URLs return HTTP 200 with an image content type.
- Grep: no hex colors or raw font sizes outside `global.css` and `src/theme/`.
- Navigation check by reading the route tree: onboarding to sign-up, sign-in, home, and back from `(auth)`.
- Not checkable here: on-device look (no iOS simulator on Windows) and the screenshot comparison with the design; those are reported as not verified and left to the user.

## Result
Built as planned. Onboarding at `/` (paging photo `FlatList`, crossfading sheet copy, progress segments, Next/Get started, Continue with Google, Skip), guest `/home`, placeholder `(auth)/sign-up` and `sign-in`, `Button` `leading`/`trailing`/`justify`, `GoogleLogo`, `glass` and `on-scrim` tokens (also in `/design-system`), `@expo/vector-icons` added. Photos: Unsplash by Maciej Marko, Daniel Begel and Hendrik Morkel, all three URLs returned HTTP 200 image/jpeg.
Verified: `tsc` clean for `src/`, lint clean, `expo export --platform ios` bundles, no hex or font sizes outside `global.css`, `src/theme/colors.ts` and `google-logo.tsx`. `expo-doctor` flags 5 patch-outdated Expo packages that were already outdated before this work (not touched).
Not verified: how the screen looks or behaves on a device (no iOS simulator on Windows), the comparison against the design screenshot, and that swiping and the Next button stay in sync in practice.

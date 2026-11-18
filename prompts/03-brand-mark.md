# Feature: Loom Stay brand mark (symbol + wordmark lockup)

Status: done

## Goal
Add a generated Loom Stay mark to the design system: a symbol plus the "Loom Stay" wordmark, usable as lockup, symbol only or wordmark only, tinted from design tokens so it works in light and dark.

## Context & Docs
- Design system: `global.css` tokens, `src/theme/`, `AppText`, plan `prompts/02-design-system.md`.
- `react-native-svg` (new dependency, approved, installed with `npx expo install`). Docs: https://docs.expo.dev/versions/v58.0.0/sdk/svg/
- The app has no brand mark; `assets/images/icon.png` and the splash are Expo template art.

## Decisions & Tradeoffs
Confirmed with the user:
- **Mark type:** symbol + wordmark lockup (symbol-only and wordmark-only from the same component).
- **Rendering:** vector via `react-native-svg`, colors from `useThemeColors()` so dark mode swaps without hex.
- **Scope:** design system only. App icon, adaptive icon, splash and favicon are not replaced now.

Defaults I picked:
- **Symbol:** a rounded-square tile in `primary-container` holding a roof chevron woven from two strands and a vertical thread (loom + stay), glyph in `on-primary-container`. 64x64 viewBox.
- **Wordmark:** Plus Jakarta Sans ExtraBold via a new `type-wordmark` text style (already-loaded font, no new asset).
- **Sizes:** sm / md / lg = symbol edge 24 / 32 / 48 with a matching wordmark size.
- **Accessibility:** the whole mark is one image with label "Loom Stay"; children are hidden from screen readers.

## Step-by-Step Implementation
1. `npx expo install react-native-svg`.
2. `global.css`: `@utility type-wordmark`; `src/theme/typography.ts`: `wordmark` variant.
3. `src/components/logo.tsx`: `Logo({ variant, size, className })`.
4. `src/app/design-system.tsx`: BRAND section (variants, sizes, light and inverse surfaces).
5. `src/app/index.tsx`: show the lockup in place of the placeholder heading.
6. `AGENTS.md`: record the mark under Design system.

## Verification
- `npx tsc --noEmit` and `npx expo lint` pass; `npx expo-doctor` shows no new issues.
- `npx expo export --platform ios` bundles.
- SVG rendered in the browser pane at 24/32/48 px on light and dark backgrounds to judge legibility.
- Grep: no hex colors or raw font sizes in `logo.tsx`.
- Not checkable here: on-device rendering (no iOS simulator on Windows).

## Result
Built as planned. `Logo` (and `LogoSymbol`) in `src/components/logo.tsx`; three wordmark sizes (`type-wordmark-sm/md/lg`) in `global.css` and `textVariants`; BRAND section in `/design-system`; lockup on the home screen; `react-native-svg@15.16.0` added. Added a `textClassName` prop for wordmark color on non-default surfaces (used on `inverse-surface`).
Verified: `tsc` clean for `src/`, lint clean, `expo export --platform ios` bundles, no hex or font sizes in `logo.tsx`. Not verified: how the symbol actually looks. A PNG render needed an unvetted download (blocked) and the browser pane refused the local web preview, so the shape has not been seen on any screen.

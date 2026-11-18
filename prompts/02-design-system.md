# Feature: Design System (tokens, fonts, shared styles)

Status: done

## Goal
Turn the "Warm Editorial Sanctuary" reference in `assets/design-systems/v1/` (`light_mode`, `dark_mode`) into the app's single source of visual truth: color roles that switch with the system theme, Plus Jakarta Sans, spacing, radii, shadows, text styles, and two primitives (`AppText`, `Button`) that later screens reuse.

## Context & Docs
- Design reference (attached each session): `assets/design-systems/v1/{light_mode,dark_mode}/DESIGN.md` (token tables), `screen.png` (rendered kit), `code.html` (Tailwind source).
- NativeWind v5 docs: https://www.nativewind.dev/v5/llms-full.txt (`@theme`, `:root` variables, dark mode via `prefers-color-scheme`, fonts as one `--font-*` per file).
- Skill: `expo-design-system` (tokens in one place, components import tokens, screens import components).
- Existing system: NativeWind v5 + Tailwind v4 in `global.css` (plan 01). No theme file exists, so nothing to extend; tokens go in `global.css`.

## Decisions & Tradeoffs
Confirmed with the user:
- **Font:** install `@expo-google-fonts/plus-jakarta-sans` (new dependency, approved). Weights 400, 500, 600, 700, 800 (400 body, 500 unselected segments, 600 labels/headlines, 700 bold, 800 display).
- **Type scale:** the light-mode scale is the single shared scale; dark mode only changes colors.
- **Dark colors:** the dark `DESIGN.md` frontmatter hexes (not the prose hexes), so both themes use the same role names.
- **Token home:** `global.css` (CSS variables + `@theme`) is the source for `className` use; a small `src/theme/` TS mirror exists only for values that can't be a `className` (status bar, icon colors, shadows in style props).

Defaults I picked (say so if you disagree):
- **Color roles:** every role in the frontmatter is defined for both themes (e.g. `surface`, `surface-container-lowest`, `on-surface`, `outline`, `primary`, `primary-container`, `secondary-container`, `error`, `success`, `warning`, `info` and their `on-*`/`-container` pairs). The light-only `success/warning/info` families get dark equivalents derived from the design's dark badge styling (listed in Open items as proposed new tokens).
- **Brand coral:** the DESIGN.md prose says `#FF385C` but the frontmatter says `#ba0036` / `#e21e4a`. The screenshots show the bright coral (`#e21e4a` light `primary-container`, `#ff5169` dark). I use the frontmatter: `primary-container` for filled actions (matches the screenshots), `primary` for text/outline accents.
- **Spacing:** Tailwind v4's 4px base stays (`p-4` = 16). Named steps added: `2xs` 2, `xs` 4, `sm` 8, `md` 16, `lg` 24, `xl` 32, `2xl` 40 (light value; dark's 48 is not used). Screen margin 16 (light value; dark's 20 not used).
- **Radii:** override Tailwind's: `sm` 4, `DEFAULT` 8, `md` 12, `lg` 16, `xl` 24, `full` 9999. Components set `borderCurve: continuous` through a `corner-squircle`-style utility only if NativeWind supports it on this version; otherwise skipped.
- **Text styles:** one `@utility` class per style (`type-display-lg` ... `type-label-sm`) bundling family, size, line-height, letter-spacing, because RN needs a different font file per weight. `AppText` maps `variant` to these classes. Tabular numbers: `tabular-nums` is web-only in NativeWind, so `AppText` takes `numeric` and sets `fontVariant: ["tabular-nums"]`.
- **Shadows:** DESIGN.md levels 2, 3, 4 as `shadow-level-*` utilities (light values). In dark mode the design uses borders plus one overlay shadow, so dark overrides are applied if the compiler accepts `box-shadow` inside a dark media query; otherwise the primitives pick the style by scheme.
- **Components:** only `AppText` and `Button` (primary, secondary, ghost; sm/md/lg; pressed, disabled, loading). Cards, chips, steppers etc. stay colocated until a second screen needs them.
- **Fonts load** in `src/app/_layout.tsx` with `useFonts` and hold the splash screen until ready.

## Step-by-Step Implementation
1. `npx expo install @expo-google-fonts/plus-jakarta-sans expo-font` (expo-font already present).
2. `global.css`: add `@theme` entries (`--color-*`, `--font-*`, `--spacing-*`, `--radius-*`) that reference runtime variables, define the light values in `:root` and dark values in `@media (prefers-color-scheme: dark) { :root { ... } }`, add `type-*` and `shadow-level-*` utilities. (Variables must be in both `@theme` and `:root`, per the NativeWind docs.)
3. `src/theme/colors.ts`: light/dark hex mirror + `useThemeColors()` (reads `useColorScheme` from `react-native`). `src/theme/index.ts` re-exports. Comment pointing to `global.css` as the source.
4. `src/components/app-text.tsx` (variant, numeric, className passthrough) and `src/components/button.tsx` (variant, size, loading, disabled, pressed feedback, 44pt min height, accessibility role/state/label).
5. `src/app/_layout.tsx`: load fonts, hold splash, set `StatusBar` style from scheme.
6. Temporary preview route `src/app/design-system.tsx` showing swatches, the type ramp, radii, shadows and buttons, used for the simulator screenshot comparison. Delete it (or keep behind `__DEV__`) once screens exist; flagged in the report.
7. `AGENTS.md`: record the lasting decisions (token home, font, `AppText`/`Button`, scale choices), replacing nothing that is still true; keep under 150 lines.

## Verification
- `npx tsc --noEmit` and `npx expo lint` pass.
- `npx expo-doctor` shows no new dependency issues.
- Preview route in the iOS simulator in light and dark (`xcrun simctl ui booted appearance dark`): screenshot compared with `light_mode/screen.png` and `dark_mode/screen.png` for colors, type, radii and shadows. Values estimated from images are listed.
- Check that fonts really render as Plus Jakarta Sans at each weight (not the system font) and that dark mode switches without reload.
- Grep: no hex colors or raw font sizes outside `global.css` and `src/theme/`.

## Open items / proposed new tokens
- Dark `success`, `warning`, `info` (+ containers) are not in the dark DESIGN.md; proposed from the dark badge/toast screenshot: success `#62dca3` on `#003823`, warning `#ffd798` on `#422c00`, info derived from `tertiary`.
- Tab-bar icons come from Material Symbols in the design; icon library not chosen here (will ask when the tab bar is built).
- This machine's `ios/` simulator checks need macOS (`xcrun`); on Windows I can only type-check, lint and bundle, so screenshot comparison would be left to you.

## Result
Built as planned. Colors (all roles, light/dark), fonts, spacing, radii, `type-*` and `shadow-level-*` utilities are in `global.css`; `src/theme`, `AppText`, `Button`, font loading and `/design-system` preview added. `npx expo install` also added the `expo-font` config plugin to `app.json`.
Verified: `tsc` clean for `src/` (the `ECC/` folder has unrelated errors), lint clean, `expo export --platform ios` compiles and the bundle contains the tokens. Not verified: on-device rendering and screenshot comparison (no simulator on Windows); dark shadows use the light values.

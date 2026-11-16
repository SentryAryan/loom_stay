# Feature: NativeWind v5 RC Setup

Status: done

## Goal
Set up NativeWind v5 Release Candidate (`nativewind@5.0.0-rc.0` with `react-native-css@3.1.0-rc.0`) and Tailwind CSS v4 (`tailwindcss@4.1.12`) on Expo SDK 58 according to https://www.nativewind.dev/v5/llms-full.txt.

## Context & Docs
- NativeWind v5 documentation: https://www.nativewind.dev/v5/llms-full.txt
- Targets: Expo 58, React Native 0.88.1, Tailwind CSS v4 (CSS-first configuration)
- Engine: `react-native-css@3.1.0-rc.0` pinned together with `nativewind@5.0.0-rc.0`
- Compiler: `lightningcss@1.30.1` pinned via npm `overrides`

## Decisions & Tradeoffs
- **NativeWind v5 RC vs v4**: v5 uses Tailwind CSS v4 and `react-native-css` runtime. Removes `nativewind/babel` and `jsxImportSource: "nativewind"`. Metro handles JSX transformation directly via `withNativewind(config)`.
- **CSS-First Configuration**: Tailwind v4 uses CSS `@import` directives in `global.css` (`tailwindcss/theme.css`, `tailwindcss/preflight.css`, `tailwindcss/utilities.css`, `nativewind/theme`) rather than a `tailwind.config.js` file.
- **PostCSS**: Requires `postcss.config.mjs` exporting `@tailwindcss/postcss`.

## Step-by-Step Implementation
1. Uninstall legacy NativeWind v4 and Tailwind v3 packages to avoid `ERESOLVE` graph conflicts.
2. Install exact dependencies:
   - `nativewind: 5.0.0-rc.0`
   - `react-native-css: 3.1.0-rc.0`
   - `tailwindcss: 4.1.12`
   - `@tailwindcss/postcss: 4.1.12`
   - `postcss: ^8.4.49`
   - `lightningcss: 1.30.1`
3. Add `"overrides": { "lightningcss": "1.30.1" }` to `package.json`.
4. Create `postcss.config.mjs` with `@tailwindcss/postcss`.
5. Remove obsolete `tailwind.config.js`.
6. Update `global.css` with Tailwind v4 layers and `nativewind/theme`.
7. Configure `babel.config.js` with clean `babel-preset-expo`.
8. Configure `metro.config.js` with `withNativewind(config)`.
9. Update `nativewind-env.d.ts` with `/// <reference types="react-native-css/types" />`.
10. Ensure root layout imports `../../global.css`.
11. Update `src/app/index.tsx` to verify className utilities.

## Verification
- [x] `npx expo-doctor`: 20/20 checks passed
- [x] `npx expo lint`: 0 errors, 0 warnings
- [x] `npx tsc --noEmit`: 0 errors in app files
- [x] `npx @tailwindcss/cli@4.1.12 --input ./global.css`: compiled cleanly in 203ms
- [x] `npm ls nativewind react-native-css tailwindcss lightningcss`: versions deduplicated and pinned

## Result
NativeWind v5 RC0 and Tailwind CSS v4 are fully configured and verified. Metro and Expo tooling run clean without errors.

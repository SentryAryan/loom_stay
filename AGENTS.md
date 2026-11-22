# Loom Stay

Expo React Native rental app. Guests describe a stay in one sentence ("quiet pet friendly cabin with a hot tub under $300 a night") and get ranked stays back. They can also ask booking and policy questions about a stay, answered with exact text from Loom Stay's own content.

This file is the project's memory: it holds every decision that is still true. Plans in `prompts/` are history.

## Commands

```bash
npx expo install <package>  # ALWAYS use instead of npm install: resolves SDK-compatible versions
npx expo start              # dev server (press i for the iOS simulator)
npx expo lint               # lint
npx tsc --noEmit            # type check
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
npx eas-cli@latest <cmd>    # EAS builds, submits, and updates (use instead of bare `eas`)
```

## Expo

- Expo ships breaking changes every SDK release, so don't trust memory. Before touching an Expo, EAS, or React Native API, check the `expo` major version in `package.json` and read `https://docs.expo.dev/versions/v<major>.0.0/`. For anything else, start from https://docs.expo.dev/llms.txt and follow its links.
- Routes live in `src/app/`: every file is a screen and `_layout.tsx` files define navigators. API routes are `src/app/api/*+api.ts`. Keep components, hooks, and utils outside `src/app/`.
- Routes now: `/` is onboarding (3 swipeable slides, `src/features/onboarding/`), `/home` is the guest home placeholder (greets the user, has Sign out), `(auth)/sign-up`, `(auth)/sign-in` and `(auth)/verify` are the real Clerk forms (`src/features/auth/`: `*-form.tsx`, `use-sign-up-flow.ts`, `use-sign-in-flow.ts`, `use-google-sign-in.ts`, `finalize-session.ts`, `auth-errors.ts`, `sso-redirect-url.ts`, `validation.ts`, `otp-input.tsx`, `social-buttons.tsx`). Clerk custom flows use the method API (`signUp.password`, `verifications.verifyEmailCode`, `finalize`); Clerk wraps real codes in `error.errors[0].code`, which `auth-errors.ts` reads. Sign-in from a device Clerk has not seen for that account (`needs_client_trust`, the instance has device trust on) emails a code: the same `/verify` screen with `?mode=device` ("Confirm it's you"). Sign-up is name + email + password, then a 6-digit email code (dev test addresses use `+clerk_test` and code 424242). The code screen's `OtpInput` sets `oneTimeCode`/`one-time-code`, so iOS offers codes from Apple Mail above the keyboard; Android can't autofill email codes, so `verify-form.tsx` has a "Paste code" button (`expo-clipboard`, `findCode` in `validation.ts` takes the first standalone 6-digit run) that fills and submits the code. Google uses `useSSO` and is offered on onboarding, sign-in and sign-up; Apple is not offered. Route guards live in `src/app/_layout.tsx` (`Stack.Protected`: signed out sees `index` and `(auth)`, signed in sees `home` and `design-system`; splash waits for Clerk `isLoaded`). `src/app/sso-callback.tsx` exists because Expo Router opens the Google return link as a route: it shows a spinner until the session is active, then goes to `/home` (or to `/` after 8s if sign-in did not complete); redirecting at once flashed onboarding. `useGoogleSignIn` also returns `isFinishing` (true once the app is active again after the browser), and the three screens with a Google button render `signing-in-overlay.tsx` while it is true, so the screen underneath is not visible while Clerk activates the session. Google returns to `loomstay://sso-callback` (`sso-redirect-url.ts`), which is on the Clerk redirect URL allowlist, so Google sign-in only works in a development or production build. Expo Go can't receive `loomstay://`, its `exp://`/`exps://` links change with every dev server and tunnel address, and Chrome never handed them back (sign-in completed in Clerk but the browser hung on Google's "signing back in" page). Expo Go also loses native modules (`Cannot find native module 'ExpoCrypto'`) when it reopens the project in the same process. `use-google-sign-in.ts` calls `WebBrowser.maybeCompleteAuthSession()` at module scope; don't add `warmUpAsync`, it didn't help. Dev instance settings: password optional (Google sign-up needs this) with minimum 8, first/last name optional. `expo-secure-store` is required by Clerk's token cache, which `src/features/auth/token-cache.ts` wraps: if a keychain read fails while the app is active, it keeps the session in memory for that run instead of leaving Clerk (and the splash) stuck forever; `expo-auth-session` (Google) needs `expo-crypto` as a direct dependency (a nested copy is not enough for builds). Adding a native module needs a new development build. The `(auth)` stack hides the native header; each screen draws `AuthHeader` inside `AuthScreen`. `TextField` and `AuthHeader` live in `src/components/`. Safe areas use `useSafeAreaInsets`, not `SafeAreaView` (className is not applied to it). Skip and Get started open sign-up; onboarding shows on every launch while signed out (no "seen" flag yet).
- `ios/` and `android/` are generated. Never create or edit them by hand; configure native behavior in `app.json` and config plugins.
- The app runs as a development build (`expo-dev-client`, package `com.aryansrivastava.loomstay`), not Expo Go. Build Android on EAS: `npx eas-cli@latest build --profile development --platform android`, then install the APK (`adb install -r <apk>` on the AVD, or the build page link on a phone). Local `npx expo run:android` fails on this machine: Reanimated's and Worklets' C++ build paths pass Windows' 260-character limit, and `subst` drive letters don't help (Node and CMake resolve the real path); only a shorter real project path would. Rebuild only after native changes; JS changes come from Metro. iOS: `native-sim up --dev --dev-url "exp+loomstay://?__expo_url=<url-encoded https tunnel URL>" --minutes <n>` builds a Debug dev client on a GitHub macOS runner and streams it (the tunnel URL changes every time Metro restarts; repoint the app from the dev menu, Go home, Enter URL manually). It runs `git add -A`, commits and pushes the current branch first, so run it from a throwaway branch in a separate clone (a git worktree breaks it), never a PR branch. Its build is unsigned (`CODE_SIGNING_ALLOWED=NO`), so every keychain call fails there; the token cache falls back to memory, so sign-ins don't survive an app restart in native-sim.

## Who owns what

Each tool has one job. Ask before moving a responsibility to a different tool.

- **Auth:** Clerk is the source of truth. The app keeps its own custom auth screens. Set Clerk up through the Clerk CLI and use the Clerk MCP for current Expo patterns.
- **Content:** Sanity (properties, hosts, policies, house rules). Studio is a standalone app in `studio/`. Schema deploys and content changes go through the Sanity MCP, and generated property copy uses Agent Actions.
- **Exact constraints** (price, guests, type, amenities, pets, place): GROQ filters, with values always passed as params.
- **Soft intent** (quiet, cozy, secluded): Dataset Embeddings via `text::semanticSimilarity()` inside `score()`.
- **Policy knowledge:** a Sanity Context endpoint in Knowledge Base mode. Context endpoints are created in the Dashboard's Context app and read with an organization token (Context Viewer), per https://www.sanity.io/docs/ai/context-migration-guide. One endpoint serves one mode. The Context skill still describes `sanity.agentContext` Studio documents with a project token; that route is deprecated, so don't use it.
- **Typed decisions** (which stay topics and policies answer a question): Jev, called from API routes through the AI SDK's `experimental_evaluate` with the `@ai-sdk/typesafe-ai` provider and `TYPESAFE_AI_API_KEY`. No Vercel AI Gateway. Keep `ai` and `@ai-sdk/typesafe-ai` pinned to exact versions, since the API is experimental.
- **Answer text:** none generated. Answers show the stay's own fields and policy text word for word, with their source. No LLM runs in the app.
- **Styling:** NativeWind v5 RC (`react-native-css` + Tailwind CSS v4). Configured in `global.css` with `@import "nativewind/theme"`; no `tailwind.config.js`. `metro.config.js` sends `expo-asset`'s `react-native` import to the real React Native, because the `react-native-css` shim lacks `AssetRegistry` (upstream issues #506/#570); without it expo-font (icons, Plus Jakarta Sans) crashes. Remove the workaround once upstream fixes it, and restart Metro with `npx expo start -c` after touching Metro config. Dark mode: `metro.config.js` sets `inlineVariables: false` so `--color-*` tokens stay dynamic, and `global.css` wraps the light `:root` values in `@media (prefers-color-scheme: light)` because react-native-css uses the first matching entry per variable (an unconditional light block always beats dark). Open the app on the AVD with `adb shell am start -a android.intent.action.VIEW -d "loomstay://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081" com.aryansrivastava.loomstay` (after `adb reverse tcp:8081 tcp:8081`).
- **Design system** (from `assets/design-systems/v1`): tokens live in `global.css` (`@theme` + `:root`, dark values under `prefers-color-scheme`): color roles (`bg-surface`, `text-on-surface-variant`, `bg-primary-container`), spacing (`p-md`, `gap-sm`; `--spacing` is pinned to 4px because native rem is 14), radii, `type-*` text styles, `shadow-level-*`. Font is Plus Jakarta Sans (one file per weight, loaded in the root layout). Never hardcode hex or font sizes; `src/theme/colors.ts` mirrors the colors only for non-className props, so change `global.css` first. Use `AppText` (`numeric` for prices, since `tabular-nums` is web only) and `Button` from `src/components/`. Success/warning/info dark values are proposed, not from the design. Brand mark: `Logo` in `src/components/logo.tsx` (`lockup`/`symbol`/`wordmark`, sizes sm/md/lg, `react-native-svg`, tinted from `primary-container` tokens; wordmark styles are `type-wordmark-*`). Icons: `@expo/vector-icons` (Ionicons); the Google "G" is a fixed-color SVG in `src/components/google-logo.tsx`, exempt from the no-hex rule. `Button` takes `leading`/`trailing` slots; the title stays centered and `trailing` is pinned to the right edge (`right-5`). Over photos use the proposed `glass` (translucent pill), `glass-dark` + `glass-dark-border` (frosted location chip: `expo-blur` `BlurView` plus these tokens; on Android the blurred content must sit inside a `BlurTargetView` and its ref goes in `blurTarget`, see `src/features/onboarding/location-chip.tsx`) and `on-scrim` (text on dark chips) tokens. Unsplash photos are hotlinked from `src/features/onboarding/slides.ts`. The onboarding sheet's curved top edge is traced from `assets/images/prompt-images/onboarding.png` (low left corner, crest about a quarter across, gentle slope, rounded right corner; measured on the emulator within 1pt of the mockup) and is the SVG path in `src/features/onboarding/sheet-backdrop.tsx`; adjust `CURVE_PATH`, don't swap it for a plain radius. The app icon and splash are still Expo template art. `src/app/design-system.tsx` is a temporary token gallery, and the "View design system" button on `src/app/index.tsx` is temporary too; delete both when real screens exist.
- **Analytics:** PostHog, identified through Clerk.

## Rules

- Secret keys (Clerk secret key, TypeSafe key, Sanity organization token, Sanity write token) never reach the app bundle. Use them only in API routes and local scripts such as seeding. Never put them behind `EXPO_PUBLIC_`, which is bundled into the app. Never commit `.env`. Keep variable names, without values, in `.env.example`.
- Sanity Context needs a deployed Studio for the dataset. Redeploy Studio from `studio/` after schema changes.
- Jev is not an agent. It answers typed questions (Choice, Noul, Score) with probabilities. It never writes GROQ, calls tools, or generates text. Code builds queries from its answers.
- Prices, guest counts, and dates are parsed in code. Jev may choose between candidates code found, but never produces the value.
- Embeddings rank, they don't filter, and they only see the document itself (no references). Hard constraints are always GROQ filters, and text that should affect ranking lives on the property document.
- Policy answers show only text from the stay's data and Loom Stay's policies, word for word. If nothing answers the question, say so and point to support.
- API routes verify the Clerk session before doing any work.
- PostHog failures never block the app. Never send what guests type, tokens, or personal data in events.
- Let Sanity generate document IDs. Model relationships as references.
- Ask before adding a dependency or service, changing the Sanity schema once content exists, or deleting data. Prefer Expo modules over third-party libraries.
- Whenever you need input from the user, ask through your tool's built-in question panel so they pick from options instead of typing. Give two to four clear options with the recommended one first. Fall back to plain text only if no such panel exists.

## How we build features

For a new feature or a change across several files. Small fixes and questions skip this.

1. **Understand.** Read the code involved. Open an earlier plan only if this feature builds directly on it (pick by file name). Read the current docs pages for the APIs you'll use, and load a matching skill if one exists (e.g. the Expo, Clerk, Sanity, Sanity Context, or TypeSafe skills). Don't write version-specific APIs from memory.
2. **Ask.** If a real decision is unclear (scope, visible behavior, data shape), ask in the question panel, batching questions into one round and following up only if the answers raise new ones. Pick defaults for the rest and list them. If a decision in this file looks wrong, raise it instead of changing it.
3. **Plan.** Copy `prompts/TEMPLATE.md` to `prompts/NN-feature-name.md` (next number) and fill it in. The plan must be self-contained, so a fresh session can build it from this file plus the plan alone.
4. **IMPORTANT: stop and wait.** Write no app code until the user approves the plan. Ask for approval in the question panel (approve, or request changes). If they request changes, update the plan and ask again. On approval, set `Status: approved`.
5. **Build** step by step, checking each one. If a step turns out wrong, stop and explain instead of redesigning.
6. **Close out.**
   - Run the plan's Verification and give the report described under Reporting.
   - Add a short `## Result` to the plan and set `Status: done`.
   - After significant codebase changes, update the graphify knowledge graph in `graphify-out/` (run the graphify skill, incremental update). Skip for small fixes.
   - Update this file: put each lasting decision in the section it belongs to. Replace or remove rules that are no longer true instead of appending. Keep this file under 150 lines.

## Building from designs

Designs are attached in the chat. Screens must match them exactly: layout, spacing, sizes, colors, type, radii, icons, and copy.

- Icons, fonts, and brand images come from `assets/` or the chosen icon library, never recreated from a screenshot. Sample property photos may be remote placeholder images. If an asset is missing, use a marked placeholder and list it.
- Map every color, font, spacing value, and radius to a design-system token. List values with no token in the plan as proposed new tokens instead of hardcoding them. When creating the design system itself, derive the tokens from the designs.
- UI plans describe the design (elements, states, tokens, assets) well enough to build without the image. If building in a new session, ask for the design to be attached again.
- After building, check the screen on a device and compare it with the design. List every difference, fix, and repeat. Report which values were estimated from an image. On macOS use the iOS simulator (`xcrun simctl openurl booted <url>`, `xcrun simctl io booted screenshot <path>`; the scheme is in `app.json`).
- On this Windows machine, test on the Android emulator yourself through `adb` (`$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe`); never ask the user for screenshots. Metro always runs on port 8081, never another port. First check it: `curl -s localhost:8081/status` should print `packager-status:running`; if one is running, use it. If not, start `npx expo start --dev-client --tunnel --port 8081` in the background (the tunnel lets a phone connect; open the dev build as described under Styling) and wait for it. Only when you need Metro's logs in your own terminal: kill the process on 8081 first, then start yours there. If 8081 is taken and you are not allowed to free it, stop and ask; never fall back to 8082. Then capture with `adb exec-out screencap -p > <scratchpad>/x.png` and Read the image; drive the UI with `adb shell input tap|swipe|keyevent` (back is 4). Fast refresh applies edits, so wait a few seconds before capturing. The floating gear button is the dev client's, not the app's.

## Reporting

End every piece of work that changes code (features and fixes, not answers to questions) with this report. Use these headings in this order, and leave out any section that would be empty.

- **Done:** one line on the outcome, then the files changed and what changed in each.
- **Verified:** each check with ✅ or ❌ and its evidence (command output, screenshot). List what wasn't checked as ❌ with the reason. Never mark something ✅ without running it.
- **You need to:** numbered actions only the user can take, such as keys, dashboard settings, manual steps in Sanity, or assets to provide.
- **Test it yourself:** numbered steps to reproduce the result from a fresh start, ending with `Expected:` and what the user should see.
- **Notes:** defaults picked, trade-offs, and anything left for later.

## Checks

- Lint and type check pass before any task is called done.
- Screens that load data handle loading, error, and empty states.
- AI features are tried against realistic inputs, and failures are explained by cause: missing data, the decision Jev made, the query, or the code.

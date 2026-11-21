# Feature: Clerk auth (replace mock auth)

Status: done

## Goal
Replace the mocked auth with Clerk, keeping the custom screens: email + password sign-up with a 6-digit email verification code, email + password sign-in, Google sign-in, persistent sessions, protected routes, and sign out.

## Context & Docs
- `@clerk/expo` 4.17.4 is installed and `ClerkProvider` (with `tokenCache` from `@clerk/expo/token-cache`) already wraps `src/app/_layout.tsx` (commit 26760b4). The Clerk skill was written against 3.6.x, so API shapes below were checked against the installed types in `node_modules/@clerk/shared/dist/types/{signInFuture,signUpFuture}.d.ts` and `node_modules/@clerk/expo/dist/hooks/useSSO.d.ts`.
- Custom flows API (current, not legacy): `useSignIn()` / `useSignUp()` return `{ signIn | signUp, errors, fetchStatus }`. Calls resolve to `{ error }` instead of throwing. `signIn.password({ emailAddress, password })`, `signUp.password({ emailAddress, password, firstName, lastName })`, `signUp.verifications.sendEmailCode()` / `verifyEmailCode({ code })`, `signX.finalize({ navigate })`, `signUp.reset()`. Never `setActive` / `prepareFirstFactor` for email flows.
- Google: root `useSSO()` from `@clerk/expo` (`startSSOFlow({ strategy: "oauth_google" })`, then `setActive({ session: createdSessionId })`). Needs `expo-auth-session` (not installed) and the existing `loomstay` scheme.
- Route protection: Expo Router `Stack.Protected` with `guard`, in the root layout, gated on `useAuth().isLoaded` / `isSignedIn`.
- Instance state read from the public environment endpoint of the dev instance (`learning-firefly-5770`): email address required with email code verification at sign-up, password required (**minimum length 15**), Google enabled, **no first/last name attributes enabled**, sign-up public.
- Secret keys: `CLERK_SECRET_KEY` in `.env.local` is not used by the app and stays out of the bundle. Only `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is read by the app.

## Decisions & Tradeoffs
- **Sign-in:** email + password (user's choice). Sign-up verifies the email with a code. No passwordless path.
- **Social:** Google wired through browser `useSSO` (works in Expo Go and dev builds, no extra Google Cloud setup on the dev instance). Apple is removed for now (needs an Apple Developer setup and is iOS only); `SocialButtons` becomes Google-only.
- **Structure:** Clerk hooks only work inside components, so `mock-auth.ts` (a plain service object) is deleted rather than swapped. Replace it with hooks in `src/features/auth/`: `use-sign-up-flow.ts`, `use-sign-in-flow.ts`, `use-google-sign-in.ts`, plus `auth-errors.ts` mapping Clerk error codes to our copy. Forms keep their layout and validation.
- **Sign-up to verify handoff:** the sign-up attempt lives in Clerk's client state, so the verify screen reuses `useSignUp()`. If no attempt exists (app restarted on the verify screen), it redirects to sign-up. "Use a different email" calls `signUp.reset()` then goes back.
- **Guards:** root layout wraps screens in `Stack.Protected`: signed out sees `index` (onboarding) and `(auth)`; signed in sees `home` and `design-system`. The splash screen stays up until fonts and `isLoaded` are both ready, so there is no sign-in flash on cold start. Signed-in users skip onboarding. Signed-out users still see onboarding on every launch (a "seen" flag is out of scope).
- **Session tasks:** if `session.currentTask` is set after finalize, show a "needs an extra step we don't support yet" message instead of navigating (none configured on this instance).
- **Sign out:** the temporary "Back to onboarding" button on `/home` becomes "Sign out" (`useClerk().signOut()`), and home greets the user by first name or email. Guards then send them to onboarding.
- **Dependency (needs your approval via this plan):** `expo-auth-session`, installed with `npx expo install`.
- **Password length:** Clerk enforces 15 characters on this instance while the form says 8. Default: lower the dashboard minimum to 8 so the app and Clerk agree. Fallback if you'd rather keep 15: change `MIN_PASSWORD_LENGTH` and the placeholder.

## Step-by-Step Implementation
1. `npx expo install expo-auth-session`.
2. Dashboard prerequisites (see "You need to"): enable first/last name, lower password minimum to 8, confirm Native API is on. If you re-authenticate the Clerk MCP, I can apply the config changes with a dry run first.
3. Add `auth-errors.ts` (map `form_password_incorrect`, `form_identifier_not_found`, `form_identifier_exists`, `form_code_incorrect`, `verification_expired`, `form_password_pwned`, `form_password_length_too_short`, `too_many_requests`, fallback), with unit-style checks via `tsc`.
4. Add `use-sign-up-flow.ts`: `submit({ name, email, password })` splits the name into first/last, calls `signUp.password`, then `verifications.sendEmailCode()`, then routes to `/verify`; `verify(code)`; `resend()`; `restart()`. Render `<View nativeID="clerk-captcha" />` in the sign-up form.
5. Add `use-sign-in-flow.ts` (`signIn.password` then `finalize`) and `use-google-sign-in.ts` (`startSSOFlow`, `setActive`; cancellation is not an error).
6. Rewire `sign-up-form.tsx`, `sign-in-form.tsx`, `verify-form.tsx` to the hooks; disable inputs while `fetchStatus === "fetching"`; show mapped errors. Make `social-buttons.tsx` Google-only (remove `SocialProvider`). Delete `mock-auth.ts`.
7. Root layout: move navigation into a `RootNavigator` inside `ClerkProvider` using `Stack.Protected`; hide splash after fonts and `isLoaded`. Remove the manual `router.replace("/home")` where finalize navigates.
8. Home: greeting and Sign out button; remove "Back to onboarding".
9. `npx tsc --noEmit`, `npx expo lint`, then run on the Android emulator (Metro check first).
10. Close out: `## Result`, `Status: done`, update AGENTS.md (routes, auth section, Apple removal, remove the mock auth description), update the graphify graph.

## Verification
- `npx tsc --noEmit` and `npx expo lint` pass.
- Emulator: sign up with a new email, receive the code, enter a wrong code (error shown), enter the right one, land on `/home` signed in.
- Kill and reopen the app: lands on `/home` without a sign-in flash (session persisted).
- Sign out: lands on onboarding; `/home` is unreachable by back navigation or deep link (`adb ... -d exp://localhost:8081/--/home`).
- Sign in with the same email and password; wrong password shows the mapped error.
- Google button opens the browser flow and returns signed in (needs you to pick a Google account on the emulator).
- Signed in, opening a `(auth)` URL redirects to `/home`.

## Result
Built as planned, plus changes found while testing on the Android emulator (Expo Go):
- `expo-secure-store` added (Clerk's token cache needs it).
- Google sign-up needed the password to be optional on the instance; Clerk `errors[0].code` is the real error code, so `auth-errors.ts` reads it first.
- Expo Go cannot receive `loomstay://`, so `sso-redirect-url.ts` uses an `exp://` URL there; every return URL is on the Clerk allowlist.
- Expo Router opens the Google return link as a route, so `src/app/sso-callback.tsx` forwards to `/home` (signed in) or `/`.
- Onboarding's Google button now runs the Google flow directly.

Verified on the emulator: sign-up with a `+clerk_test` address, wrong then right code, session persists across app restart, sign out to onboarding, wrong then right password sign-in, `sso-callback` link signed out (onboarding) and signed in (home). `tsc` (outside `ECC/`) and `expo lint src` clean. Google end to end was seen working by the user (session created, return link reached the app); my own run stalled on Google's consent page on the emulator.

### Follow-up fixes (same day)
- Google return no longer flashes onboarding: `sso-callback.tsx` shows a spinner until the session is active (redirects to `/` after 8s if it never is).
- Sign-in from a new device (Clerk `needs_client_trust`) now shows a "Confirm it's you" code step (`/verify?mode=device`, `use-sign-in-flow.ts`) instead of "extra verification not supported". Verified on the AVD after clearing Expo Go data: password sign-in, then code 424242, then Home.
- Metro port rule (always 8081) added to AGENTS.md.
- Google return still showed onboarding once while Clerk activated the session; `use-google-sign-in.ts` now exposes `isFinishing` (set when `AppState` becomes active again) and onboarding, sign-in and sign-up cover themselves with `signing-in-overlay.tsx` until the guards move to Home. tsc/lint clean; not verified end to end on the AVD (Google's consent page ignores adb taps there), needs a check on a phone.
- `expo-crypto` added as a direct dependency (expo-auth-session's docs require it; it was only a nested copy). A user reported `Cannot find native module 'ExpoCrypto'` after switching to Expo Go; not reproducible in Expo Go on the AVD in `--go`, `--dev-client`, and `--dev-client --tunnel` modes (Google opened the browser each time). Any development build made before expo-crypto/expo-secure-store were added must be rebuilt.

# Feature: Sign up, verification, and sign in screens (mocked auth)

Status: done

## Goal
Build the sign-up screen from `assets/images/prompt-images/auth.png`, plus a verification (6-digit code) screen and a sign-in screen derived from it, with navigation and form interactions between them. Authentication is mocked behind one small service so Clerk can replace it later.

## Context & Docs
- Design: `assets/images/prompt-images/auth.png` (sign-up only). It is a layout reference: the brand is "roam" and the button is yellow, which do not follow our system. `Logo` and `primary-container` replace them. Verification and sign-in are not designed; they are derived from sign-up.
- Existing: `src/app/(auth)/{_layout,sign-up,sign-in}.tsx`, `src/features/auth/auth-placeholder.tsx` (to be deleted), `Button` (`leading`/`trailing`), `AppText`, `Logo`, `GoogleLogo`, `useThemeColors`.
- Docs to read before building (SDK 58, https://docs.expo.dev/versions/v58.0.0/): expo-router (typed routes, `router.push` with params, `useLocalSearchParams`, `Stack` `headerShown`), React Native `TextInput` (`textContentType`, `autoComplete`, `keyboardType`, `returnKeyType`, `onSubmitEditing`), `KeyboardAvoidingView`.
- No new dependencies. Clerk is out of scope.

## Decisions & Tradeoffs
Confirmed with the user:
- **Brand:** Loom Stay tokens, `Logo`, and `primary-container` button. Layout, spacing, and copy follow the mockup.
- **Missing screens:** derived from sign-up (same layout and components).
- **Mock behavior:** client-side validation, faked success, see below.
- **Apple button:** rendered on iOS only. Google shows everywhere. Both are mocked and go to `/home`.

Defaults I picked (say so if you disagree):
- **Header:** the `(auth)` Stack hides its native header. A shared `AuthHeader` draws the circular back button on the left (hidden on the first screen reached with no history) and `Logo` on the right, as in the design.
- **Routes:** `(auth)/sign-up`, `(auth)/sign-in`, new `(auth)/verify` with an `email` param. "Sign in" / "Create account" links use `router.replace` so the two forms don't stack. Sign-up pushes to verify, so back returns to the form.
- **Validation (pure functions in `validation.ts`):** name required (trimmed, at least 2 chars), email must match a simple pattern, password at least 8 chars. Errors show under the field after the field is blurred or after a submit attempt, in `text-error`, and the field gets an `error` border.
- **Mock service (`mock-auth.ts`):** one `authService` object with `signUp`, `verifyCode`, `resendCode`, `signIn`, `signInWithProvider`, each resolving after about 600 ms. Verify code `123456` succeeds; any other 6 digits rejects with "That code doesn't match. Try again." Sign-in accepts any valid email and password. A comment marks it as the Clerk swap point. Errors are shown as a form-level message above the button.
- **Verification screen:** title "Check your email", body "We sent a 6-digit code to {email}.". Six digit boxes backed by one hidden `TextInput` (`keyboardType="number-pad"`, `autoComplete="one-time-code"`, `textContentType="oneTimeCode"`), so paste and SMS/email autofill work. It verifies automatically on the sixth digit. "Resend code" has a 30 s countdown. "Use a different email" goes back. Success goes to `/home` with `router.replace`.
- **Loading:** `Button` `loading` while the mock call runs; fields are disabled meanwhile.
- **Keyboard:** screen is a `ScrollView` inside `KeyboardAvoidingView` with `keyboardShouldPersistTaps="handled"`. Return key moves name, email, password, then submits.
- **Accessibility:** every input has a label, the eye toggle has an `accessibilityLabel` ("Show password" / "Hide password"), errors use `accessibilityLiveRegion="polite"`.
- **Components (reusable, in `src/components/`):** `TextField` (icon, label, input, optional trailing slot, error), `AuthHeader`. Auth-specific pieces in `src/features/auth/`: `SocialButtons` (divider plus Google and Apple), `AuthScreen` (header, title, body, scroll and keyboard wrapper), `OtpInput`.

## Design mapping and proposed new tokens
| Design | Our implementation |
| --- | --- |
| Screen background white | `bg-surface` |
| Back button, circle with hairline border | 44pt `rounded-full border border-outline-variant` with `Ionicons chevron-back` |
| "roam" wordmark top right | `Logo` (`wordmark`, sm/md) |
| Title "Create your account" 2 lines, ExtraBold | `AppText displayLgMobile` (28/34); estimated from the image, will compare on the emulator and move to `displayLg` if it reads smaller than the mockup |
| Subtitle gray | `bodyLg`, `text-on-surface-variant` |
| Field: light gray card, radius ~16, leading icon, label + placeholder | `bg-surface-container rounded-lg px-md`, min height 64; icon `Ionicons` (person-outline, mail-outline, lock-closed-outline); label `headlineSm`, input `bodyMd`, placeholder color `onSurfaceVariant` via `useThemeColors` |
| Eye toggle | `Ionicons eye-outline` / `eye-off-outline`, 44pt hit area |
| Primary button, full pill, trailing arrow | `Button variant="primary" size="lg"` with `trailing` `arrow-forward` |
| "or" divider | two `bg-outline-variant` hairlines with `bodyMd` label |
| Google / Apple outlined pills | `Button variant="secondary" size="lg"`, `GoogleLogo` and `Ionicons logo-apple` in `leading` |
| "Already have an account? Sign in" | `bodyMd` `text-on-surface-variant` plus underlined `text-on-surface` link, 44pt tap target |

Proposed new tokens: none. Estimated from the image: field height, title size, spacing between blocks. Assets: none missing; the Apple mark is an Ionicons glyph (monochrome, `text-on-surface`).

## Step-by-Step Implementation
1. Read the expo-router and TextInput docs listed above. Confirm typed routes are on (`experiments.typedRoutes` in `app.json`) so `/verify` links type-check; if not, plain strings are used.
2. `src/features/auth/validation.ts` with `validateName`, `validateEmail`, `validatePassword`, `isValidCode`, each returning an error string or `null`.
3. `src/features/auth/mock-auth.ts` with the `authService` described above.
4. `src/components/text-field.tsx` and `src/components/auth-header.tsx`.
5. `src/features/auth/auth-screen.tsx` (wrapper), `social-buttons.tsx`, `otp-input.tsx`.
6. Rewrite `sign-up.tsx` (name, email, password; on success push to `/verify?email=`), `sign-in.tsx` (email, password; success to `/home`), add `verify.tsx`.
7. Set `headerShown: false` in `(auth)/_layout.tsx`; delete `auth-placeholder.tsx`.
8. Run `npx tsc --noEmit` and `npx expo lint`, fix issues.
9. Test on the Android emulator via `adb` (check Metro first), compare each screen with the design, list and fix differences.
10. Close out: add `## Result`, set `Status: done`, update `AGENTS.md` (routes, auth placeholder note, new components and the mock service as the Clerk swap point).

## Verification
- `npx tsc --noEmit` and `npx expo lint` pass.
- Sign up: empty submit shows three errors; invalid email and short password show their messages; valid input goes to verify with the email shown.
- Verify: `123456` goes to `/home`; another code shows the error and clears the boxes; resend countdown works; back returns to sign-up.
- Sign in: validation, success to `/home`, and the "Create account" link goes to sign-up.
- Google button goes to `/home`; Apple button absent on Android.
- Keyboard does not cover the focused field or the button; return key chain works.
- Screenshots of all three screens in light mode compared with the design, and a dark-mode check, using `adb`.

## Result
Built as planned. Deviations: `SafeAreaView` ignores className under NativeWind v5, so `AuthScreen` uses `useSafeAreaInsets`; the back button is always shown (history is checked at press time, falling back to `/`); title uses `displayLg` (36) to match the mockup's size. Verified on the Android emulator: sign-up validation, field chain, verify error and success, sign-in validation, and the switch link. `tsc` (src) and `expo lint src` clean.

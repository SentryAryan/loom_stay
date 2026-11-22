// Where the browser sends the guest back after Google: the app's own scheme, which is
// on Clerk's redirect URL allowlist. Google sign-in needs a development or production
// build. Expo Go can't receive loomstay://, and the exp:// links it can receive change
// with every dev server address and were never handed back by the browser.
export const SSO_REDIRECT_URL = "loomstay://sso-callback";

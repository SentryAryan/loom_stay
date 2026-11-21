import Constants from "expo-constants";
import * as Linking from "expo-linking";

const CALLBACK_PATH = "sso-callback";

// Where the browser sends the guest back after Google. Expo Go can't receive the
// app's own scheme (loomstay://), so there it must be an exp:// link to the dev
// server; development and production builds use the app scheme.
// Every URL this returns must be on Clerk's redirect URL allowlist.
export function ssoRedirectUrl(): string {
  // expoGoConfig only exists inside Expo Go (executionEnvironment reports "bare" there).
  const isExpoGo = Constants.expoGoConfig != null;
  const host = Constants.expoConfig?.hostUri;
  if (isExpoGo && host) return `exp://${host}/--/${CALLBACK_PATH}`;
  return Linking.createURL(CALLBACK_PATH);
}

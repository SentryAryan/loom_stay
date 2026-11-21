import { useSignIn } from "@clerk/expo";

import { authErrorMessage } from "./auth-errors";
import { finalizeSession } from "./finalize-session";

const SIGN_IN_FALLBACK = "We couldn't sign you in. Check your details and try again.";
const UNSUPPORTED_STEP = "Your account needs an extra verification step that Loom Stay doesn't support yet.";
const DEVICE_CODE_FALLBACK = "We couldn't send the code. Try again.";

export interface PasswordSignInResult {
  // Message for the screen to show, or null when there is none.
  error: string | null;
  // True when Clerk wants an emailed code to confirm a device it hasn't seen for this account.
  needsDeviceCode: boolean;
}

// Actions return an error message for the screen to show, or null on success.
export function useSignInFlow() {
  const { signIn } = useSignIn();

  // True while a sign-in is waiting on the new-device code (or just completed).
  const hasDeviceVerification = signIn.status === "needs_client_trust" || signIn.status === "complete";

  async function signInWithPassword(email: string, password: string): Promise<PasswordSignInResult> {
    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) return { error: authErrorMessage(error, SIGN_IN_FALLBACK), needsDeviceCode: false };

    if (signIn.status === "needs_client_trust") {
      const sendError = await sendDeviceCode();
      return { error: sendError, needsDeviceCode: sendError === null };
    }
    if (signIn.status !== "complete") return { error: UNSUPPORTED_STEP, needsDeviceCode: false };
    return { error: await finalizeSession(signIn, SIGN_IN_FALLBACK), needsDeviceCode: false };
  }

  async function sendDeviceCode(): Promise<string | null> {
    const { error } = await signIn.mfa.sendEmailCode();
    return error ? authErrorMessage(error, DEVICE_CODE_FALLBACK) : null;
  }

  async function verifyDeviceCode(code: string): Promise<string | null> {
    const { error } = await signIn.mfa.verifyEmailCode({ code });
    if (error) return authErrorMessage(error, "Something went wrong. Try again.");
    if (signIn.status !== "complete") return UNSUPPORTED_STEP;
    return finalizeSession(signIn, SIGN_IN_FALLBACK);
  }

  // Drops the in-progress sign-in so the guest can start over.
  function restart(): void {
    signIn.reset();
  }

  return {
    hasDeviceVerification,
    emailAddress: signIn.identifier,
    signInWithPassword,
    resendDeviceCode: sendDeviceCode,
    verifyDeviceCode,
    restart,
  };
}

import { useSignUp } from "@clerk/expo";

import { authErrorMessage } from "./auth-errors";
import { finalizeSession } from "./finalize-session";

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

// Each action returns an error message for the screen to show, or null on success.
export function useSignUpFlow() {
  const { signUp } = useSignUp();

  // True while a sign-up exists (unverified, or just completed and signing in), which
  // is what the verify screen needs to stay put.
  const hasSignUpInProgress = signUp.status === "missing_requirements" || signUp.status === "complete";

  async function start({ name, email, password }: SignUpInput): Promise<string | null> {
    const [firstName, ...rest] = name.trim().split(/\s+/);
    const lastName = rest.join(" ");
    const created = await signUp.password({
      emailAddress: email,
      password,
      firstName,
      ...(lastName ? { lastName } : {}),
    });
    if (created.error) return authErrorMessage(created.error, "We couldn't create your account. Try again.");
    return sendCode();
  }

  async function sendCode(): Promise<string | null> {
    const { error } = await signUp.verifications.sendEmailCode();
    return error ? authErrorMessage(error, "We couldn't send the code. Try again.") : null;
  }

  async function verify(code: string): Promise<string | null> {
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) return authErrorMessage(error, "Something went wrong. Try again.");
    if (signUp.status !== "complete") return "We couldn't finish creating your account. Try again.";
    return finalizeSession(signUp, "Something went wrong. Try again.");
  }

  // Drops the in-progress sign-up so the guest can start over with another email.
  function restart(): void {
    signUp.reset();
  }

  return { hasSignUpInProgress, emailAddress: signUp.emailAddress, start, resend: sendCode, verify, restart };
}

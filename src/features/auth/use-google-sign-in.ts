import { useSSO } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { AppState } from "react-native";

import { authErrorMessage } from "./auth-errors";
import { SSO_REDIRECT_URL } from "./sso-redirect-url";

const GOOGLE_FALLBACK = "We couldn't sign you in with Google. Try again.";
const MISSING_REQUIREMENTS = "Google didn't share everything we need to create your account.";

// Closes a browser auth session left open when the app is reopened from the return link.
WebBrowser.maybeCompleteAuthSession();

// signInWithGoogle returns an error message for the screen to show, or null on success or
// when the guest closes the browser (cancelling is not an error).
//
// isFinishing turns true when the app comes back from the browser and stays true until
// the flow ends. Clerk still has to activate the session at that point, and the screen
// that started the flow would otherwise be visible meanwhile (a flash of onboarding).
// Screens cover themselves with <SigningInOverlay /> while it is true. On success it is
// left on: the route guards leave the screen as soon as the session is active.
export function useGoogleSignIn() {
  const { startSSOFlow } = useSSO();
  const [isFinishing, setIsFinishing] = useState(false);

  async function signInWithGoogle(): Promise<string | null> {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") setIsFinishing(true);
    });
    try {
      const { createdSessionId, setActive, signUp } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: SSO_REDIRECT_URL,
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        return null;
      }
      setIsFinishing(false);
      return signUp?.status === "missing_requirements" ? MISSING_REQUIREMENTS : null;
    } catch (error: unknown) {
      setIsFinishing(false);
      return authErrorMessage(error, GOOGLE_FALLBACK);
    } finally {
      subscription.remove();
    }
  }

  return { signInWithGoogle, isFinishing };
}

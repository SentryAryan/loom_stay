import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";

// A signed-in guest who opens "/" (a cold start) finds no matching screen, because onboarding is
// only for signed-out guests. Send them to Home, and everyone else back to the start.
export default function NotFound() {
  const { isSignedIn } = useAuth();
  return <Redirect href={isSignedIn ? "/home" : "/"} />;
}

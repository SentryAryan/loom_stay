import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { useThemeColors } from "@/theme";

// How long to wait for the session before assuming the sign-in did not complete.
const SESSION_WAIT_MS = 8000;

// Google sends the guest back here (loomstay://sso-callback or exp://.../--/sso-callback).
// Expo Router treats that link as a route, so it needs a screen. useSSO finishes the
// sign-in a moment after the link arrives, so this screen waits for the session instead of
// redirecting at once (that showed onboarding for a split second). It is not inside a
// guard group because it must open either way.
export default function SsoCallback() {
  const colors = useThemeColors();
  const { isLoaded, isSignedIn } = useAuth();
  const [hasWaitedTooLong, setHasWaitedTooLong] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setHasWaitedTooLong(true), SESSION_WAIT_MS);
    return () => clearTimeout(id);
  }, []);

  if (isLoaded && isSignedIn) return <Redirect href="/home" />;
  if (hasWaitedTooLong) return <Redirect href="/" />;

  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <ActivityIndicator color={colors.onSurfaceVariant} />
    </View>
  );
}

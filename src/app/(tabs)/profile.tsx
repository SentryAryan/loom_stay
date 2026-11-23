import { useClerk, useUser } from "@clerk/expo";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";

// Placeholder profile: who is signed in and Sign out. The real profile comes with its own feature.
export default function Profile() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const displayName = user?.fullName ?? user?.primaryEmailAddress?.emailAddress;

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <View className="flex-1 justify-center gap-lg bg-surface px-margin" style={{ paddingTop: insets.top }}>
      <View className="items-center gap-sm">
        <AppText variant="headlineXl" accessibilityRole="header">
          Profile
        </AppText>
        {displayName ? (
          <AppText variant="bodyLg" className="text-on-surface-variant">
            {displayName}
          </AppText>
        ) : null}
      </View>

      {/* TEMPORARY: remove with src/app/design-system.tsx once real screens exist. */}
      <Button title="View design system" variant="secondary" onPress={() => router.push("/design-system")} />

      {/* Signing out clears the session; the route guards then show onboarding. */}
      <Button title="Sign out" variant="secondary" loading={isSigningOut} onPress={handleSignOut} />
    </View>
  );
}

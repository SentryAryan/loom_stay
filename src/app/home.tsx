import { useClerk, useUser } from "@clerk/expo";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { Logo } from "@/components/logo";

// Placeholder guest home; real search arrives with the stays feature.
export default function Home() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const displayName = user?.firstName ?? user?.primaryEmailAddress?.emailAddress;

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center gap-lg bg-surface p-margin">
      <View className="items-center gap-sm">
        <Logo size="lg" />
        {displayName ? (
          <AppText variant="headlineSm" className="text-on-surface">
            Hi, {displayName}
          </AppText>
        ) : null}
        <AppText variant="bodyMd" className="text-on-surface-variant">
          Find a stay in one sentence.
        </AppText>
      </View>

      {/* TEMPORARY: remove with src/app/design-system.tsx once real screens exist. */}
      <Button
        title="View design system"
        variant="secondary"
        onPress={() => router.push("/design-system")}
      />

      {/* Signing out clears the session; the route guards then show onboarding. */}
      <Button title="Sign out" variant="secondary" loading={isSigningOut} onPress={handleSignOut} />
    </View>
  );
}

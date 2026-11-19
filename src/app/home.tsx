import { router } from "expo-router";
import { View } from "react-native";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { Logo } from "@/components/logo";

// Placeholder guest home; real search arrives with the stays feature.
export default function Home() {
  return (
    <View className="flex-1 items-center justify-center gap-lg bg-surface p-margin">
      <View className="items-center gap-sm">
        <Logo size="lg" />
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

      {/* TEMPORARY: lets us rerun the onboarding and auth flow. Remove once real auth and a home exist. */}
      <Button
        title="Back to onboarding"
        variant="secondary"
        onPress={() => router.replace("/")}
      />
    </View>
  );
}

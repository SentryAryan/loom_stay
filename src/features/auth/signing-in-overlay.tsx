import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useThemeColors } from "@/theme";

// Full-screen cover shown while Clerk finishes a Google sign-in, so the screen underneath
// (onboarding, sign-in, sign-up) is not visible for the moment before Home appears.
export function SigningInOverlay() {
  const colors = useThemeColors();

  return (
    <View
      style={StyleSheet.absoluteFill}
      className="items-center justify-center bg-surface"
      accessibilityLabel="Signing you in"
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator color={colors.onSurfaceVariant} />
    </View>
  );
}

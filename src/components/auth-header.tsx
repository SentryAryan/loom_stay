import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { useThemeColors } from "@/theme";

import { Logo } from "./logo";

// Round back button on the left, brand mark on the right.
export function AuthHeader() {
  const colors = useThemeColors();

  // Checked at press time: the history is not settled on the first render.
  // With no history (e.g. opened from a link) go to the start screen.
  function handleBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  return (
    <View className="min-h-12 flex-row items-center justify-between">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={handleBack}
        className="size-12 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest active:scale-95"
      >
        <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
      </Pressable>
      <Logo size="md" />
    </View>
  );
}

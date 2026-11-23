import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { useThemeColors } from "@/theme";

// Placeholder until booking exists: an honest empty state with a way back to searching.
export default function Trips() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 items-center justify-center gap-lg bg-surface px-xl" style={{ paddingTop: insets.top }}>
      <View className="size-20 items-center justify-center rounded-full bg-surface-container">
        <Ionicons name="calendar-outline" size={32} color={colors.onSurface} />
      </View>
      <View className="items-center gap-sm">
        <AppText variant="headlineXl" accessibilityRole="header">
          No trips yet
        </AppText>
        <AppText variant="bodyLg" className="text-center text-on-surface-variant">
          Stays you book will show up here.
        </AppText>
      </View>
      <Button title="Find a stay" onPress={() => router.navigate("/search")} />
    </View>
  );
}

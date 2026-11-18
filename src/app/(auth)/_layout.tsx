import { Stack } from "expo-router";

import { useThemeColors } from "@/theme";

export default function AuthLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerTitle: "",
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
        contentStyle: { backgroundColor: colors.surface },
      }}
    />
  );
}

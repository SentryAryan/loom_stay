import { Stack } from "expo-router";

import { useThemeColors } from "@/theme";

// Each auth screen draws its own header (AuthHeader), so the native one is off.
export default function AuthLayout() {
  const colors = useThemeColors();

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }} />;
}

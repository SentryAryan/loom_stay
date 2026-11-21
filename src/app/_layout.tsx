import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import "../../global.css";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { colorScheme } from "react-native-css";
import { useEffect, useLayoutEffect } from "react";
import { useColorScheme } from "react-native";

import { useThemeColors } from "@/theme";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add your key to .env.local.\nRun: 1) clerk auth login  2) clerk link  3) clerk env pull — then restart the dev server.");
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colors = useThemeColors();
  const systemScheme = useColorScheme();

  // The CSS dark media query reads its own copy of the scheme, which can stay
  // stale on Android. Push the live system scheme into it so classNames match.
  useLayoutEffect(() => {
    colorScheme.set(systemScheme === "dark" ? "dark" : "light");
  }, [systemScheme]);
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const isReady = fontsLoaded || fontError != null;

  if (!isReady) return null;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <StatusBar style="auto" />
      <RootNavigator />
    </ClerkProvider>
  );
}

// Signed-out guests see onboarding and the auth screens; signed-in guests see the
// app. Guards are client-side UX only: anything sensitive must be checked server-side.
function RootNavigator() {
  const colors = useThemeColors();
  const { isLoaded, isSignedIn } = useAuth();

  // Keep the splash up until Clerk has restored the saved session, so a signed-in
  // guest never sees a flash of onboarding on a cold start.
  useEffect(() => {
    if (isLoaded) void SplashScreen.hideAsync();
  }, [isLoaded]);

  if (!isLoaded) return null;

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
      }}
    >
      <Stack.Screen name="sso-callback" options={{ headerShown: false }} />
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!isSignedIn}>
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="design-system" />
      </Stack.Protected>
    </Stack>
  );
}
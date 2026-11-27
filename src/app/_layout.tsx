import "@/config/web-polyfills";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import "../../global.css";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { colorScheme } from "react-native-css";
import { useEffect, useLayoutEffect, useRef } from "react";
import { PostHogProvider } from "posthog-react-native";
import { useColorScheme } from "react-native";

import { posthog } from "@/config/posthog";
import { tokenCache } from "@/features/auth/token-cache";
import { SearchStateProvider } from "@/features/stays/search-state";
import { FILTER_DETENT, SORT_DETENT } from "@/features/stays/sheet-detents";
import { useThemeColors } from "@/theme";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add your key to .env.local.\nRun: 1) clerk auth login  2) clerk link  3) clerk env pull — then restart the dev server.");
}

SplashScreen.preventAutoHideAsync();

const sheetOptions = {
  presentation: "formSheet",
  headerShown: false,
  sheetGrabberVisible: true,
  sheetCornerRadius: 24,
} as const;

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

  const content = (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SearchStateProvider>
        <PostHogIdentity />
        <StatusBar style="auto" />
        <RootNavigator />
      </SearchStateProvider>
    </ClerkProvider>
  );

  return posthog ? <PostHogProvider client={posthog}>{content}</PostHogProvider> : content;
}

function PostHogIdentity() {
  const { isLoaded, user } = useUser();
  const identifiedUserId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      if (identifiedUserId.current) {
        posthog?.reset();
        identifiedUserId.current = undefined;
      }
      return;
    }

    if (identifiedUserId.current === user.id) return;

    if (identifiedUserId.current) posthog?.reset();

    posthog?.identify(user.id, {
      $set: {
        ...(user.primaryEmailAddress?.emailAddress ? { $email: user.primaryEmailAddress.emailAddress } : {}),
        ...(user.fullName ? { $name: user.fullName } : {}),
        ...(user.firstName ? { $first_name: user.firstName } : {}),
        ...(user.lastName ? { $last_name: user.lastName } : {}),
      },
    });
    identifiedUserId.current = user.id;
  }, [isLoaded, user]);

  return null;
}

// Signed-out guests see onboarding and the auth screens; signed-in guests see the
// app. Guards are client-side UX only: anything sensitive must be checked server-side.
function RootNavigator() {
  const colors = useThemeColors();
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    posthog?.screen(pathname);
  }, [pathname]);

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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="design-system" />
        {/* Bottom sheets opened from the Search tab. Android draws no native header in a sheet. */}
        <Stack.Screen
          name="filters"
          options={{ ...sheetOptions, sheetAllowedDetents: [FILTER_DETENT], contentStyle: { backgroundColor: colors.surface } }}
        />
        <Stack.Screen
          name="sort"
          options={{ ...sheetOptions, sheetAllowedDetents: [SORT_DETENT], contentStyle: { backgroundColor: colors.surface } }}
        />
      </Stack.Protected>
    </Stack>
  );
}
import { Ionicons } from "@expo/vector-icons";
import { Platform, View } from "react-native";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { GoogleLogo } from "@/components/google-logo";
import { useThemeColors } from "@/theme";

import type { SocialProvider } from "./mock-auth";

interface SocialButtonsProps {
  onPress: (provider: SocialProvider) => void;
  disabled?: boolean;
}

// "or" divider plus provider buttons. Apple sign-in is iOS only.
export function SocialButtons({ onPress, disabled }: SocialButtonsProps) {
  const colors = useThemeColors();

  return (
    <View className="gap-md">
      <View className="flex-row items-center gap-md" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View className="h-px flex-1 bg-outline" />
        <AppText variant="bodyMd" className="text-on-surface-variant">
          or
        </AppText>
        <View className="h-px flex-1 bg-outline" />
      </View>
      <Button
        title="Continue with Google"
        variant="secondary"
        size="lg"
        disabled={disabled}
        leading={<GoogleLogo size={22} />}
        onPress={() => onPress("google")}
      />
      {Platform.OS === "ios" ? (
        <Button
          title="Continue with Apple"
          variant="secondary"
          size="lg"
          disabled={disabled}
          leading={<Ionicons name="logo-apple" size={24} color={colors.onSurface} />}
          onPress={() => onPress("apple")}
        />
      ) : null}
    </View>
  );
}

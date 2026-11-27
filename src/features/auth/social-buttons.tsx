import { View } from "react-native";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { GoogleLogo } from "@/components/google-logo";

interface SocialButtonsProps {
  onGooglePress: () => void;
  disabled?: boolean;
}

// "or" divider plus the Google button. Apple sign-in is not offered yet.
export function SocialButtons({ onGooglePress, disabled }: SocialButtonsProps) {
  return (
    <View className="gap-md">
      <View className="flex-row items-center gap-md" aria-hidden>
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
        onPress={onGooglePress}
      />
    </View>
  );
}

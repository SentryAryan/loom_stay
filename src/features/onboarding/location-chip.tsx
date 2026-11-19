import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import type { ComponentRef, RefObject } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { AppText } from "@/components/app-text";
import { useThemeColors } from "@/theme";

interface LocationChipProps {
  place: string;
  /** Ref of the BlurTargetView that wraps the photos. Android blurs only what is inside it. */
  blurTarget: RefObject<ComponentRef<typeof View> | null>;
}

/** Frosted-glass location chip over the photo: blur, translucent dark fill and a hairline border. */
export function LocationChip({ place, blurTarget }: LocationChipProps) {
  const colors = useThemeColors();

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      className="mb-md ml-lg self-start overflow-hidden rounded-full border border-glass-dark-border bg-glass-dark"
    >
      <BlurView
        blurTarget={blurTarget}
        blurMethod="dimezisBlurView"
        intensity={40}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View className="flex-row items-center gap-xs px-md py-xs">
        <Ionicons name="location-sharp" size={16} color={colors.onScrim} />
        <AppText variant="labelMd" className="text-on-scrim">
          {place}
        </AppText>
      </View>
    </Animated.View>
  );
}

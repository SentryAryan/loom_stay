import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/app-text";
import { useThemeColors } from "@/theme";

import type { Stay } from "./stays";

interface StayCardProps {
  stay: Stay;
  onPress?: () => void;
}

// Large photo card for Home: rating pill top right, place and title over a scrim at the
// bottom, a round open button bottom right. Press scales the whole card slightly.
export function StayCard({ stay, onPress }: StayCardProps) {
  const colors = useThemeColors();
  const place = `${stay.city}, ${stay.state}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${stay.title}, ${place}, rated ${stay.rating}, $${stay.pricePerNight} a night`}
      onPress={onPress}
      className="h-70 overflow-hidden rounded-xl bg-surface-container-high transition-transform duration-150 active:scale-[0.97]"
    >
      <Image
        source={{ uri: stay.imageUri }}
        contentFit="cover"
        transition={200}
        accessibilityLabel={stay.imageAlt}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { experimental_backgroundImage: `linear-gradient(to bottom, transparent 38%, ${colors.scrim} 100%)` },
        ]}
      />

      <View className="absolute right-3.5 top-3.5 h-9 flex-row items-center gap-1.5 rounded-full bg-surface-container-lowest px-3.5">
        <Ionicons name="star" size={16} color={colors.secondaryContainer} />
        <AppText variant="headlineSm" numeric className="font-bold">
          {stay.rating.toFixed(1)}
        </AppText>
      </View>

      <View className="absolute bottom-4.5 left-4.5 right-23 gap-1.5">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="location-outline" size={16} color={colors.onScrim} />
          <AppText variant="bodyMd" className="text-on-scrim" numberOfLines={1}>
            {place}
          </AppText>
        </View>
        <AppText variant="headlineXl" className="text-on-scrim" numberOfLines={2}>
          {stay.title}
        </AppText>
      </View>

      <View className="absolute bottom-4 right-4 size-14 items-center justify-center rounded-full bg-surface-container-lowest">
        <Ionicons name="chevron-forward" size={22} color={colors.onSurface} />
      </View>
    </Pressable>
  );
}

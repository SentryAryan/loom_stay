import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { AppText } from "@/components/app-text";
import { useThemeColors } from "@/theme";

import { amenityLabels, type AmenityId, type Stay } from "./stays";

type IconName = ComponentProps<typeof Ionicons>["name"];

const amenityIcons: Record<AmenityId, IconName> = {
  "hot-tub": "thermometer-outline",
  pets: "paw-outline",
  pool: "water-outline",
  "ocean-view": "eye-outline",
  fireplace: "flame-outline",
  "lake-view": "eye-outline",
  "city-view": "eye-outline",
  workspace: "laptop-outline",
};

const TAGS_SHOWN = 2;

interface StayRowProps {
  stay: Stay;
  /** Amenities the guest filtered on; they show first so a match is never hidden behind other tags. */
  highlightAmenities?: readonly AmenityId[];
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPress?: () => void;
}

// Search result: photo on the left, details on the right, heart top right.
export function StayRow({ stay, highlightAmenities = [], isFavorite, onToggleFavorite, onPress }: StayRowProps) {
  const colors = useThemeColors();
  const tags = [...stay.amenities]
    .sort((a, b) => Number(highlightAmenities.includes(b)) - Number(highlightAmenities.includes(a)))
    .slice(0, TAGS_SHOWN);
  const isReducedMotion = useReducedMotion();
  const heartScale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.get() }] }));

  function handleHeart() {
    onToggleFavorite(stay.id);
    // A quick press-in then a springy settle; reduced motion just swaps the icon.
    if (!isReducedMotion) {
      heartScale.set(
        withSequence(withTiming(0.8, { duration: 80 }), withSpring(1, { duration: 300, dampingRatio: 0.6 })),
      );
    }
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${stay.title}, ${stay.city}, ${stay.state}, rated ${stay.rating}, $${stay.pricePerNight} a night`}
      onPress={onPress}
      className="flex-row gap-3.5 px-md transition-transform duration-150 active:scale-[0.98]"
    >
      {/* expo-image takes no className, so the sized, rounded frame is a View around it. */}
      <View className="h-34 w-31 overflow-hidden rounded-xl bg-surface-container-high">
        <Image
          source={{ uri: stay.imageUri }}
          contentFit="cover"
          transition={200}
          accessibilityLabel={stay.imageAlt}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View className="flex-1 gap-1 pr-11">
        <AppText variant="headlineMd" numberOfLines={2}>
          {stay.title}
        </AppText>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="location-outline" size={16} color={colors.onSurfaceVariant} />
          <AppText variant="bodyMd" className="text-on-surface-variant" numberOfLines={1}>
            {stay.city}, {stay.state}
          </AppText>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="star" size={16} color={colors.secondaryContainer} />
          <AppText variant="headlineSm" numeric>
            {stay.rating.toFixed(1)}
          </AppText>
          <AppText variant="bodyMd" numeric className="text-on-surface-variant">
            ({stay.reviewCount})
          </AppText>
        </View>
        <View className="flex-row flex-wrap gap-1.5 pt-0.5">
          {tags.map((amenity) => (
            <View
              key={amenity}
              className="h-7 flex-row items-center gap-1.5 rounded-full bg-surface-container px-2.5"
            >
              <Ionicons name={amenityIcons[amenity]} size={14} color={colors.onSurface} />
              <AppText variant="labelMd">{amenityLabels[amenity]}</AppText>
            </View>
          ))}
        </View>
        <View className="flex-row items-baseline gap-1 pt-0.5">
          <AppText variant="headlineXl" numeric>
            ${stay.pricePerNight}
          </AppText>
          <AppText variant="bodyMd" className="text-on-surface-variant">
            / night
          </AppText>
        </View>
      </View>

      <Animated.View style={heartStyle} className="absolute right-md top-0">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? `Remove ${stay.title} from favorites` : `Save ${stay.title}`}
          accessibilityState={{ selected: isFavorite }}
          hitSlop={4}
          onPress={handleHeart}
          className="size-11 items-center justify-center rounded-full bg-surface-container"
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? colors.primaryContainer : colors.onSurface}
          />
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

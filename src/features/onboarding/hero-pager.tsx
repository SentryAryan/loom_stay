import { Image } from "expo-image";
import { useEffect, type RefObject } from "react";
import {
  FlatList,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import type { OnboardingSlide } from "./slides";

interface HeroPagerProps {
  slides: readonly OnboardingSlide[];
  listRef: RefObject<FlatList<OnboardingSlide> | null>;
  onIndexChange: (index: number) => void;
}

/** Full-screen, swipeable photos. The bottom sheet is drawn over them by the screen. */
export function HeroPager({ slides, listRef, onIndexChange }: HeroPagerProps) {
  const { width, height } = useWindowDimensions();

  // Warm the cache so swiping never shows an empty frame. A failed prefetch is
  // harmless: each photo still loads on its own and keeps the placeholder color.
  useEffect(() => {
    Image.prefetch(slides.map((s) => s.imageUri), "memory-disk").catch(() => undefined);
  }, [slides]);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    onIndexChange(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <FlatList
      ref={listRef}
      data={slides}
      keyExtractor={(s) => s.id}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={handleMomentumEnd}
      getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
      renderItem={({ item }) => (
        <View className="bg-surface-container" style={{ width, height }}>
          <Image
            source={{ uri: item.imageUri }}
            contentFit="cover"
            transition={300}
            accessibilityLabel={item.imageAlt}
            style={{ width, height }}
          />
        </View>
      )}
    />
  );
}

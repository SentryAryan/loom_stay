import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { GoogleLogo } from "@/components/google-logo";
import { Logo } from "@/components/logo";
import { HeroPager } from "@/features/onboarding/hero-pager";
import { ProgressSegments } from "@/features/onboarding/progress-segments";
import { onboardingSlides, type OnboardingSlide } from "@/features/onboarding/slides";
import { useThemeColors } from "@/theme";

const LAST_INDEX = onboardingSlides.length - 1;

export default function Onboarding() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [index, setIndex] = useState(0);

  const slide = onboardingSlides[index];
  const isLast = index === LAST_INDEX;

  const handlePrimary = () => {
    if (isLast) {
      router.push("/sign-up");
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    setIndex(index + 1);
  };

  return (
    <View className="flex-1 bg-surface-container">
      <HeroPager slides={onboardingSlides} listRef={listRef} onIndexChange={setIndex} />

      {/* Brand and Skip, over the photo. */}
      <View className="absolute inset-x-0 top-0" style={{ paddingTop: insets.top }} pointerEvents="box-none">
        <View className="flex-row items-center justify-between px-lg pt-sm" pointerEvents="box-none">
          <View className="rounded-full bg-glass px-md py-xs">
            <Logo size="sm" />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            onPress={() => router.replace("/home")}
            className="min-h-11 justify-center rounded-full bg-glass px-md active:scale-95"
          >
            <AppText variant="headlineSm">Skip</AppText>
          </Pressable>
        </View>
      </View>

      {/* Location chip and bottom sheet. */}
      <View className="absolute inset-x-0 bottom-0" pointerEvents="box-none">
        <Animated.View
          key={`place-${slide.id}`}
          entering={FadeIn.duration(250)}
          className="mb-md ml-lg flex-row items-center gap-xs self-start rounded-full bg-scrim px-md py-xs"
        >
          <Ionicons name="location-sharp" size={16} color={colors.onScrim} />
          <AppText variant="labelMd" className="text-on-scrim">
            {slide.place}
          </AppText>
        </Animated.View>

        <View
          className="gap-md rounded-t-xl bg-surface-container-lowest px-lg pt-lg shadow-level-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <ProgressSegments total={onboardingSlides.length} current={index} />

          <Animated.View key={`copy-${slide.id}`} entering={FadeIn.duration(250)} className="gap-sm">
            <AppText variant="displayLgMobile" accessibilityRole="header">
              {slide.title}
            </AppText>
            <AppText variant="bodyLg" className="text-on-surface-variant">
              {slide.body}
            </AppText>
          </Animated.View>

          <View className="gap-sm pt-sm">
            <Button
              title={isLast ? "Get started" : "Next"}
              size="lg"
              justify="between"
              onPress={handlePrimary}
              trailing={<Ionicons name="arrow-forward" size={20} color={colors.onPrimaryContainer} />}
            />
            <Button
              title="Continue with Google"
              variant="secondary"
              size="lg"
              leading={<GoogleLogo size={20} />}
              onPress={() => router.push("/sign-in")}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
